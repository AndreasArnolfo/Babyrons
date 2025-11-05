import { create } from 'zustand';
import { Baby, Event, AppSettings, ServiceType } from '../data/types';
import { StorageKeys, getStorageItem, setStorageItem } from '../lib/storage';
import { babyColors } from '../theme/colors';
import { fetchBabies, fetchEvents, upsertBaby, deleteBabyAndEvents, upsertEvent, deleteEvent } from '../api/supabaseData';

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
  removeBaby: (id: string) => void;
  updateBaby: (id: string, updates: Partial<ExtendedBaby>) => void;
  
  addEvent: (event: Omit<Event, 'id' | 'createdBy'>) => void;
  removeEvent: (id: string) => void;
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
    const [babies, events] = await Promise.all([
      fetchBabies(userId),
      fetchEvents(userId),
    ]);
    const extendedBabies: ExtendedBaby[] = babies.map(baby => ({
      ...baby,
      photo: baby.photo === undefined ? null : baby.photo,
    }));
    set({ babies: extendedBabies, events });
    get().saveToStorage();
  },
  
  // ✅ MODIFIÉ : prend maintenant un objet complet pour le bébé
  addBaby: (babyData) => {
    const babies = get().babies;
    const colorIndex = babies.length % babyColors.length;

    const newBaby: ExtendedBaby = {
      id: `baby-${Date.now()}`,
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
      createdAt: Date.now(),
    };

    set({ babies: [...babies, newBaby] });
    get().saveToStorage();
    const userId = get().userId;
    if (userId) { void upsertBaby(userId, newBaby); }
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
      const baby = get().babies.find(b => b.id === id);
      if (baby) { void upsertBaby(userId, baby); }
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
      return {
        settings: { ...state.settings, enabledServices: newEnabled },
      };
    });
    get().saveToStorage();
  },
  
  updateSettings: (updates: Partial<AppSettings>) => {
    set(state => ({
      settings: { ...state.settings, ...updates },
    }));
    get().saveToStorage();
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
