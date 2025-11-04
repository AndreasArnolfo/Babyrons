import { Platform } from 'react-native';

let storage: any = null;

if (Platform.OS !== 'web') {
  try {
    const { MMKV } = require('react-native-mmkv');
    storage = new MMKV({
      id: 'babyrons-storage',
    });
  } catch (error) {
    console.warn('MMKV not available, using fallback storage');
  }
}

export const StorageKeys = {
  BABIES: 'babies',
  EVENTS: 'events',
  SETTINGS: 'settings',
} as const;

export function getStorageItem<T>(key: string): T | null {
  try {
    let item: string | null = null;
    
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        item = window.localStorage.getItem(key);
      }
    } else if (storage) {
      item = storage.getString(key);
    }
    
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    const stringValue = JSON.stringify(value);
    
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, stringValue);
      }
    } else if (storage) {
      storage.set(key, stringValue);
    }
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } else if (storage) {
      storage.delete(key);
    }
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

export function clearStorage(): void {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } else if (storage) {
      storage.clearAll();
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
