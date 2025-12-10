import { Platform } from 'react-native';

export const StorageKeys = {
    BABIES: 'babies',
    EVENTS: 'events',
    SETTINGS: 'settings',
} as const;

export function getStorageItem<T>(key: string): T | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
    } catch (error) {
        console.error(`Error reading ${key} from storage:`, error);
    }
    return null;
}

export function setStorageItem<T>(key: string, value: T): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stringValue = JSON.stringify(value);
            window.localStorage.setItem(key, stringValue);
        }
    } catch (error) {
        console.error(`Error writing ${key} to storage:`, error);
    }
}

export function removeStorageItem(key: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    } catch (error) {
        console.error(`Error removing ${key} from storage:`, error);
    }
}

export function clearStorage(): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
        }
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
}
