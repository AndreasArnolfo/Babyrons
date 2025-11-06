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
  updateBaby: (id: string, updates: Partial<ExtendedBaby>) => void;
  
  addEvent: (event: Omit<Event, 'id' | 'createdBy'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
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
  
  removeEvent: (id: string) => {
    set(state => ({
      events: state.events.filter(e => e.id !== id),
    }));
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void deleteEvent(userId, id); }
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
