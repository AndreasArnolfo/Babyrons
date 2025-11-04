import { create } from 'zustand';
import { Baby, Event, AppSettings, ServiceType } from '../data/types';
import { storage, StorageKeys, getStorageItem, setStorageItem } from '../lib/storage';
import { babyColors } from '../theme/colors';

interface BabyStore {
  babies: Baby[];
  events: Event[];
  settings: AppSettings;
  
  addBaby: (name: string) => void;
  removeBaby: (id: string) => void;
  updateBaby: (id: string, updates: Partial<Baby>) => void;
  
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
    babies: getStorageItem<Baby[]>(StorageKeys.BABIES) || [],
    events: getStorageItem<Event[]>(StorageKeys.EVENTS) || [],
    settings: getStorageItem<AppSettings>(StorageKeys.SETTINGS) || defaultSettings,
  };

  return {
    ...initialState,
  
  addBaby: (name: string) => {
    const babies = get().babies;
    const colorIndex = babies.length % babyColors.length;
    const newBaby: Baby = {
      id: `baby-${Date.now()}`,
      name,
      color: babyColors[colorIndex],
      createdAt: Date.now(),
    };
    set({ babies: [...babies, newBaby] });
    get().saveToStorage();
  },
  
  removeBaby: (id: string) => {
    set(state => ({
      babies: state.babies.filter(b => b.id !== id),
      events: state.events.filter(e => e.babyId !== id),
    }));
    get().saveToStorage();
  },
  
  updateBaby: (id: string, updates: Partial<Baby>) => {
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
  },
  
  removeEvent: (id: string) => {
    set(state => ({
      events: state.events.filter(e => e.id !== id),
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
    const babies = getStorageItem<Baby[]>(StorageKeys.BABIES) || [];
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
