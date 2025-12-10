import { MMKV } from 'react-native-mmkv';

let storage: MMKV | null = null;

try {
  storage = new MMKV({
    id: 'babyrons-storage',
  });
} catch (error) {
  console.warn('MMKV failed to initialize:', error);
}

export const StorageKeys = {
  BABIES: 'babies',
  EVENTS: 'events',
  SETTINGS: 'settings',
} as const;

export function getStorageItem<T>(key: string): T | null {
  try {
    if (storage) {
      const item = storage.getString(key);
      return item ? JSON.parse(item) : null;
    }
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
  }
  return null;
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    if (storage) {
      const stringValue = JSON.stringify(value);
      storage.set(key, stringValue);
    }
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    if (storage) {
      storage.delete(key);
    }
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

export function clearStorage(): void {
  try {
    if (storage) {
      storage.clearAll();
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
