import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill conditionally
if (Platform.OS !== 'web') {
    require('react-native-url-polyfill/auto');
}

let supabaseClient: SupabaseClient | null = null;
let hasWarned = false;

export function getSupabase(): SupabaseClient | null {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

    // Debug identifying which environment and logic is running
    console.log(`[Supabase] Initializing client. Platform: ${Platform.OS}`);

    if (!url || !anonKey) {
        if (!hasWarned) {
            console.warn('Supabase non configuré: définissez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY');
            hasWarned = true;
        }
        return null;
    }

    if (!supabaseClient) {
        const clientOptions = Platform.OS === 'web'
            ? {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                },
            }
            : {
                auth: {
                    storage: AsyncStorage,
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false,
                },
            };

        supabaseClient = createClient(url, anonKey, clientOptions);
    }
    return supabaseClient;
}
