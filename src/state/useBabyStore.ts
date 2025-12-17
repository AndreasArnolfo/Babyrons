import { create } from 'zustand';
import { Baby, Event, AppSettings, ServiceType, ExtendedBaby } from '../data/types';
import { StorageKeys, getStorageItem, setStorageItem } from '../lib/storage';
import { babyColors } from '../theme/colors';
import { fetchBabies, fetchEvents, fetchSettings, upsertBaby, deleteBabyAndEvents, upsertEvent, deleteEvent, upsertSettings } from '../api/supabaseData';
import { scheduleFeedingNotification, scheduleDiaperNotification, cancelFeedingNotification, cancelDiaperNotification } from '../utils/notifications';

interface BabyStore {
  babies: ExtendedBaby[];
  events: Event[];
  settings: AppSettings;
  userId?: string | null;
  setUserId: (userId: string | null) => void;
  loadFromSupabase: () => Promise<void>;

  addBaby: (babyData: { name: string; gender?: 'male' | 'female' | null; birthDate?: number | null; photo?: string | null }) => void;
  addBabyFromSupabase: (baby: ExtendedBaby) => void;
  removeBaby: (id: string) => void;
  removeBabyFromSupabase: (id: string) => void;
  updateBaby: (id: string, updates: Partial<ExtendedBaby>) => void;
  updateBabyFromSupabase: (id: string, updates: Partial<ExtendedBaby>) => void;

  addEvent: (event: Omit<Event, 'id' | 'createdBy'>) => void;
  addEventFromSupabase: (event: Event) => void;
  removeEvent: (id: string) => void;
  removeEventFromSupabase: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  updateEventFromSupabase: (id: string, updates: Partial<Event>) => void;
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
  themeMode: 'auto',
  isPro: false,
  notificationsEnabled: true,
};

// Helper: Sync notifications based on latest events
const syncBabyNotifications = (get: () => BabyStore, babyId: string) => {
  const state = get();
  // Default enabled if undefined
  if (state.settings.notificationsEnabled === false) return;

  const baby = state.babies.find(b => b.id === babyId);
  if (!baby) return;

  const events = state.events.filter(e => e.babyId === babyId);

  // 1. Feeding: Find LATEST bottle
  const lastBottle = events
    .filter(e => e.type === 'bottle')
    .sort((a, b) => b.at - a.at)[0];

  if (lastBottle) {
    scheduleFeedingNotification(baby.id, baby.name, lastBottle.at);
  } else {
    cancelFeedingNotification(baby.id);
  }

  // 2. Diaper: Find LATEST dirty/both diaper
  const lastDirtyDiaper = events
    .filter(e => e.type === 'diaper' && ((e as any).kind === 'dirty' || (e as any).kind === 'both'))
    .sort((a, b) => b.at - a.at)[0];

  if (lastDirtyDiaper) {
    scheduleDiaperNotification(baby.id, baby.name, lastDirtyDiaper.at);
  } else {
    cancelDiaperNotification(baby.id);
  }
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
          if (baby.photo && baby.photo.startsWith('file://')) {
            const newPhotoUrl = await migrateLocalPhotoToStorage(baby.photo, userId, baby.id);
            if (newPhotoUrl) {
              const updatedBaby = { ...baby, photo: newPhotoUrl };
              await upsertBaby(userId, updatedBaby);
              return updatedBaby;
            } else {
              console.warn(`Impossible de migrer la photo pour ${baby.name}`);
              const updatedBaby = { ...baby, photo: null };
              await upsertBaby(userId, updatedBaby);
              return updatedBaby;
            }
          }
          return { ...baby, photo: baby.photo === undefined ? null : baby.photo };
        })
      );

      set({ babies: migratedBabies, events });
      const finalSettings = settings || get().settings;
      set({ babies: migratedBabies, events, settings: finalSettings });

      if (!settings && userId) {
        void upsertSettings(userId, finalSettings);
      }
      get().saveToStorage();
    },

    addBaby: (babyData) => {
      const babies = get().babies;
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const newId = `baby-${timestamp}-${random}`;

      if (babies.some(b => b.id === newId)) {
        console.warn('ID de bébé déjà existant, génération d\'un nouvel ID');
        return get().addBaby(babyData);
      }

      const colorIndex = babies.length % babyColors.length;
      const newBaby: ExtendedBaby = {
        id: newId,
        name: babyData.name,
        gender: babyData.gender || null,
        birthDate: babyData.birthDate || null,
        photo: babyData.photo || null,
        color: babyData.gender === 'male' ? '#9CC6E7' : babyData.gender === 'female' ? '#E8B7D4' : babyColors[colorIndex],
        createdAt: timestamp,
      };

      set({ babies: [...babies, newBaby] });
      get().saveToStorage();
      const userId = get().userId;
      if (userId) { void upsertBaby(userId, newBaby); }
    },

    addBabyFromSupabase: (baby: ExtendedBaby) => {
      const babies = get().babies;
      if (babies.some(b => b.id === baby.id)) return;
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

      // Cleanup notifications
      cancelFeedingNotification(id);
      cancelDiaperNotification(id);
    },

    removeBabyFromSupabase: (id: string) => {
      const babies = get().babies;
      if (!babies.some(b => b.id === id)) return;
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

    updateBabyFromSupabase: (id: string, updates: Partial<ExtendedBaby>) => {
      const babies = get().babies;
      const baby = babies.find(b => b.id === id);
      if (!baby) return;
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

      // Sync Notifications
      syncBabyNotifications(get, newEvent.babyId);

      const userId = get().userId;
      if (userId) { void upsertEvent(userId, newEvent); }
    },

    addEventFromSupabase: (event: Event) => {
      const events = get().events;
      if (events.some(e => e.id === event.id)) return;
      set(state => ({ events: [...state.events, event] }));
      get().saveToStorage();
      // Sync notifications on sync? Maybe overkill as it might span old events.
      // But safe to keep consistent state.
      syncBabyNotifications(get, event.babyId);
    },

    removeEvent: (id: string) => {
      const eventToRemove = get().events.find(e => e.id === id);
      if (!eventToRemove) return;

      set(state => ({
        events: state.events.filter(e => e.id !== id),
      }));
      get().saveToStorage();

      // Sync Notifications
      syncBabyNotifications(get, eventToRemove.babyId);

      const userId = get().userId;
      if (userId) { void deleteEvent(userId, id); }
    },

    removeEventFromSupabase: (id: string) => {
      const events = get().events;
      const eventToRemove = events.find(e => e.id === id);
      if (!eventToRemove) return;

      set(state => ({
        events: state.events.filter(e => e.id !== id),
      }));
      get().saveToStorage();

      // Sync Notifications
      syncBabyNotifications(get, eventToRemove.babyId);
    },

    updateEvent: (id: string, updates: Partial<Event>) => {
      const existingEvent = get().events.find(e => e.id === id);
      if (!existingEvent) return;

      set(state => ({
        events: state.events.map(e =>
          e.id === id ? { ...e, ...updates } as Event : e
        ),
      }));
      get().saveToStorage();

      // Sync Notifications
      syncBabyNotifications(get, existingEvent.babyId);

      const userId = get().userId;
      if (userId) {
        const updatedEvent = get().events.find(e => e.id === id);
        if (updatedEvent) { void upsertEvent(userId, updatedEvent); }
      }
    },

    updateEventFromSupabase: (id: string, updates: Partial<Event>) => {
      const events = get().events;
      const event = events.find(e => e.id === id);
      if (!event) return;

      const updatedEvents = events.map(e =>
        e.id === id ? { ...e, ...updates } as Event : e
      );
      set({ events: updatedEvents });
      get().saveToStorage();

      // Sync Notifications
      syncBabyNotifications(get, event.babyId);
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

      // If notifications settings changed, we might need to resync all babies?
      // For now assume user toggles manually.
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
