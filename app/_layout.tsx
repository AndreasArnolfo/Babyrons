import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import 'react-native-reanimated';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { Colors } from '../src/theme/colors';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { session, loading } = useSupabaseAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const root = segments[0] as string | undefined;
    // Si non connecté et on tente d'aller dans les tabs -> rediriger vers login
    if (!session && root === '(tabs)') {
      router.replace('/login');
      return;
    }
    // Si connecté et on est sur la page login -> rediriger vers tabs
    if (session && root === 'login') {
      router.replace('/(tabs)');
      return;
    }
    // Laisser passer reset-password, modals et autres routes publiques
  }, [session, loading, segments]);

  // Charger les données utilisateur depuis Supabase à la connexion
  useEffect(() => {
    const { useBabyStore } = require('../src/state/useBabyStore');
    const store = useBabyStore.getState();
    if (session?.user?.id) {
      store.setUserId(session.user.id);
      store.loadFromSupabase();
    } else {
      store.setUserId(null);
    }
  }, [session]);

  // Gérer les deep links pour la réinitialisation de mot de passe
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      
      // Vérifier si c'est un lien de réinitialisation
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        // Attendre un peu pour que Supabase traite les tokens
        setTimeout(() => {
          router.replace('/reset-password');
        }, 500);
      }
    };

    // Écouter les deep links initiaux
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('reset-password') || url.includes('type=recovery'))) {
        setTimeout(() => {
          router.replace('/reset-password');
        }, 500);
      }
    });

    // Écouter les nouveaux deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral.lightGray }}>
        <ActivityIndicator size="large" color={Colors.pastel.mintActive} />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modals/add-event" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="modals/manage-baby" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
