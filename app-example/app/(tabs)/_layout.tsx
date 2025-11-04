import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
// Nous n'utilisons plus Colors ou useColorScheme pour forcer le design pastel
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// --- Définissons nos couleurs pastel ---
const babyBlue = '#89CFF0'; // Un bleu ciel doux
const softGrey = '#B0C4DE'; // Un gris-bleu clair pour l'inactif
const softWhite = '#FDFDFD'; // Un fond très légèrement blanc cassé

export default function TabLayout() {
  // On n'utilise pas le colorScheme pour garder le look "bébé"
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        // --- Styles pour le look enfantin ---
        tabBarActiveTintColor: babyBlue,
        tabBarInactiveTintColor: softGrey,

        tabBarStyle: {
          backgroundColor: softWhite,
          height: 70, // Un peu plus haut pour un effet "costaud"
          paddingBottom: 10, // Ajuste la position (pour iPhone avec "Home bar")
          paddingTop: 5,
          borderTopWidth: 0, // Enlève la ligne de bordure en haut
          // Ajoute une ombre douce pour un effet "flottant"
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5, // Nécessaire pour l'ombre sur Android
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600', // Un peu plus gras pour la lisibilité
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil', // Titre en français
          // 'house.fill' est bien, ou 'heart.fill' pour un look mignon
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Jouer', // Un titre plus enfantin que "Explore"
          // 'sparkles' (paillettes) est plus magique et enfantin
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
    </Tabs>
  );
}