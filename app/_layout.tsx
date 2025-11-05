import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
    // Laisser passer les modals et autres routes
  }, [session, loading, segments]);

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
