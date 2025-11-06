import { create } from 'zustand';
import { Baby, Event, AppSettings, ServiceType } from '../data/types';
import { StorageKeys, getStorageItem, setStorageItem } from '../lib/storage';
import { babyColors } from '../theme/colors';
import { fetchBabies, fetchEvents, fetchSettings, upsertBaby, deleteBabyAndEvents, upsertEvent, deleteEvent, upsertSettings } from '../api/supabaseData';

// 🍼 Nouveau : interface Baby enrichie
export interface ExtendedBaby extends Baby {
  gender?: 'male' | 'female' | null;
  photo: string | null;
}

interface BabyStore {
  babies: ExtendedBaby[];
  events: Event[];
  settings: AppSettings;
  userId?: string | null;
  setUserId: (userId: string | null) => void;
  loadFromSupabase: () => Promise<void>;
  
  addBaby: (babyData: { name: string; gender?: 'male' | 'female' | null; birthDate?: number | null; photo?: string | null }) => void;
  addBabyFromSupabase: (baby: ExtendedBaby) => void; // Pour ajouter un bébé venant de Supabase (sans upsert)
  removeBaby: (id: string) => void;
  removeBabyFromSupabase: (id: string) => void; // Pour supprimer un bébé venant de Supabase (sans delete)
  updateBaby: (id: string, updates: Partial<ExtendedBaby>) => void;
  updateBabyFromSupabase: (id: string, updates: Partial<ExtendedBaby>) => void; // Pour mettre à jour un bébé venant de Supabase (sans upsert)
  
  addEvent: (event: Omit<Event, 'id' | 'createdBy'>) => void;
  addEventFromSupabase: (event: Event) => void; // Pour ajouter un événement venant de Supabase (sans upsert)
  removeEvent: (id: string) => void;
  removeEventFromSupabase: (id: string) => void; // Pour supprimer un événement venant de Supabase (sans delete)
  updateEvent: (id: string, updates: Partial<Event>) => void;
  updateEventFromSupabase: (id: string, updates: Partial<Event>) => void; // Pour mettre à jour un événement venant de Supabase (sans upsert)
  getEventsByBaby: (babyId: string) => Event[];
  getEventsByType: (type: ServiceType) => Event[];
  
  toggleService: (service: ServiceType) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const defaultSettings: AppSettings = {
  enabledServices: ['bottle', 'sleep', 'med', 'diaper', 'growth'],
  theme: 'pastel',
  isPro: false,
};

export const useBabyStore = create<BabyStore>((set, get) => {
  const initialState = {
    babies: getStorageItem<ExtendedBaby[]>(StorageKeys.BABIES) || [],
    events: getStorageItem<Event[]>(StorageKeys.EVENTS) || [],
    settings: getStorageItem<AppSettings>(StorageKeys.SETTINGS) || defaultSettings,
  };

  return {
    ...initialState,
    userId: null,

  setUserId: (userId: string | null) => {
    set({ userId });
  },

  loadFromSupabase: async () => {
    const userId = get().userId;
    if (!userId) return;
    const [babies, events, settings] = await Promise.all([
      fetchBabies(userId),
      fetchEvents(userId),
      fetchSettings(userId),
    ]);
    
    // Migrer les photos locales vers Supabase Storage
    const { migrateLocalPhotoToStorage } = await import('../lib/photoUpload');
    const migratedBabies = await Promise.all(
      babies.map(async (baby) => {
        // Si la photo est une URL locale, la migrer vers Storage
        if (baby.photo && baby.photo.startsWith('file://')) {
          const newPhotoUrl = await migrateLocalPhotoToStorage(
            baby.photo,
            userId,
            baby.id
          );
          if (newPhotoUrl) {
            // Mettre à jour le bébé avec la nouvelle URL
            const updatedBaby = { ...baby, photo: newPhotoUrl };
            await upsertBaby(userId, updatedBaby);
            return updatedBaby;
          } else {
            // Si la migration échoue, garder null (photo perdue)
            console.warn(`Impossible de migrer la photo pour ${baby.name}`);
            const updatedBaby = { ...baby, photo: null };
            await upsertBaby(userId, updatedBaby);
            return updatedBaby;
          }
        }
        return {
          ...baby,
          photo: baby.photo === undefined ? null : baby.photo,
        };
      })
    );
    
    set({ babies: migratedBabies, events });
    const finalSettings = settings || get().settings;
    set({ 
      babies: migratedBabies, 
      events,
      settings: finalSettings,
    });
    // Si les settings n'existent pas encore dans Supabase, les créer
    if (!settings && userId) {
      void upsertSettings(userId, finalSettings);
    }
    get().saveToStorage();
  },
  
  // ✅ MODIFIÉ : prend maintenant un objet complet pour le bébé
  addBaby: (babyData) => {
    const babies = get().babies;
    
    // Générer un ID unique (ajouter un random pour éviter les collisions si créés dans la même ms)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const newId = `baby-${timestamp}-${random}`;
    
    // Vérifier que l'ID n'existe pas déjà (sécurité supplémentaire)
    if (babies.some(b => b.id === newId)) {
      console.warn('ID de bébé déjà existant, génération d\'un nouvel ID');
      return get().addBaby(babyData); // Réessayer avec un nouvel ID
    }
    
    const colorIndex = babies.length % babyColors.length;

    const newBaby: ExtendedBaby = {
      id: newId,
      name: babyData.name,
      gender: babyData.gender || null,
      birthDate: babyData.birthDate || null,
      photo: babyData.photo || null,
      color:
        babyData.gender === 'male'
          ? '#9CC6E7'
          : babyData.gender === 'female'
          ? '#E8B7D4'
          : babyColors[colorIndex],
      createdAt: timestamp,
    };

    set({ babies: [...babies, newBaby] });
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void upsertBaby(userId, newBaby); }
  },

  // Ajouter un bébé venant de Supabase (sans déclencher d'upsert pour éviter les boucles)
  addBabyFromSupabase: (baby: ExtendedBaby) => {
    const babies = get().babies;
    // Vérifier qu'il n'existe pas déjà
    if (babies.some(b => b.id === baby.id)) {
      return; // Déjà présent, ne rien faire
    }
    set({ babies: [...babies, baby] });
    get().saveToStorage();
  },
  
  removeBaby: (id: string) => {
    set(state => ({
      babies: state.babies.filter(b => b.id !== id),
      events: state.events.filter(e => e.babyId !== id),
    }));
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void deleteBabyAndEvents(userId, id); }
  },

  // Supprimer un bébé venant de Supabase (sans déclencher de delete pour éviter les boucles)
  removeBabyFromSupabase: (id: string) => {
    const babies = get().babies;
    // Vérifier qu'il existe
    if (!babies.some(b => b.id === id)) {
      return; // N'existe pas, ne rien faire
    }
    set(state => ({
      babies: state.babies.filter(b => b.id !== id),
      events: state.events.filter(e => e.babyId !== id),
    }));
    get().saveToStorage();
  },
  
  updateBaby: (id: string, updates: Partial<ExtendedBaby>) => {
    set(state => ({
      babies: state.babies.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
    get().saveToStorage();
    const userId = get().userId;
    if (userId) {
      const updatedBaby = get().babies.find(b => b.id === id);
      if (updatedBaby) { void upsertBaby(userId, updatedBaby); }
    }
  },

  // Mettre à jour un bébé venant de Supabase (sans déclencher d'upsert pour éviter les boucles)
  updateBabyFromSupabase: (id: string, updates: Partial<ExtendedBaby>) => {
    const babies = get().babies;
    const baby = babies.find(b => b.id === id);
    if (!baby) {
      return; // N'existe pas, ne rien faire
    }
    set(state => ({
      babies: state.babies.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
    get().saveToStorage();
  },
  
  addEvent: (event: Omit<Event, 'id' | 'createdBy'>) => {
    const newEvent = {
      ...event,
      id: `event-${Date.now()}`,
      createdBy: 'local',
    } as Event;
    set(state => ({ events: [...state.events, newEvent] }));
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void upsertEvent(userId, newEvent); }
  },

  // Ajouter un événement venant de Supabase (sans déclencher d'upsert pour éviter les boucles)
  addEventFromSupabase: (event: Event) => {
    const events = get().events;
    // Vérifier qu'il n'existe pas déjà
    if (events.some(e => e.id === event.id)) {
      return; // Déjà présent, ne rien faire
    }
    set(state => ({ events: [...state.events, event] }));
    get().saveToStorage();
  },
  
  removeEvent: (id: string) => {
    set(state => ({
      events: state.events.filter(e => e.id !== id),
    }));
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void deleteEvent(userId, id); }
  },

  // Supprimer un événement venant de Supabase (sans déclencher de delete pour éviter les boucles)
  removeEventFromSupabase: (id: string) => {
    const events = get().events;
    // Vérifier qu'il existe
    if (!events.some(e => e.id === id)) {
      return; // N'existe pas, ne rien faire
    }
    set(state => ({
      events: state.events.filter(e => e.id !== id),
    }));
    get().saveToStorage();
  },
  
  updateEvent: (id: string, updates: Partial<Event>) => {
    set(state => ({
      events: state.events.map(e => 
        e.id === id ? { ...e, ...updates } as Event : e
      ),
    }));
    get().saveToStorage();
    const userId = get().userId;
    if (userId) {
      const updatedEvent = get().events.find(e => e.id === id);
      if (updatedEvent) { void upsertEvent(userId, updatedEvent); }
    }
  },

  // Mettre à jour un événement venant de Supabase (sans déclencher d'upsert pour éviter les boucles)
  updateEventFromSupabase: (id: string, updates: Partial<Event>) => {
    const events = get().events;
    const event = events.find(e => e.id === id);
    if (!event) {
      return; // N'existe pas, ne rien faire
    }
    set(state => ({
      events: state.events.map(e => 
        e.id === id ? { ...e, ...updates } as Event : e
      ),
    }));
    get().saveToStorage();
  },
  
  getEventsByBaby: (babyId: string) => {
    return get().events.filter(e => e.babyId === babyId);
  },
  
  getEventsByType: (type: ServiceType) => {
    return get().events.filter(e => e.type === type);
  },
  
  toggleService: (service: ServiceType) => {
    set(state => {
      const enabled = state.settings.enabledServices;
      const newEnabled = enabled.includes(service)
        ? enabled.filter(s => s !== service)
        : [...enabled, service];
      const newSettings = { ...state.settings, enabledServices: newEnabled };
      return {
        settings: newSettings,
      };
    });
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void upsertSettings(userId, get().settings); }
  },
  
  updateSettings: (updates: Partial<AppSettings>) => {
    set(state => {
      const newSettings = { ...state.settings, ...updates };
      return {
        settings: newSettings,
      };
    });
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void upsertSettings(userId, get().settings); }
  },
  
  loadFromStorage: () => {
    const babies = getStorageItem<ExtendedBaby[]>(StorageKeys.BABIES) || [];
    const events = getStorageItem<Event[]>(StorageKeys.EVENTS) || [];
    const settings = getStorageItem<AppSettings>(StorageKeys.SETTINGS) || defaultSettings;
    set({ babies, events, settings });
  },
  
  saveToStorage: () => {
    const { babies, events, settings } = get();
    setStorageItem(StorageKeys.BABIES, babies);
    setStorageItem(StorageKeys.EVENTS, events);
    setStorageItem(StorageKeys.SETTINGS, settings);
  },
  };
});
