
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';



// --- Palette Pastel "Babyrons" ---
// J'ai choisi un "vert menthe" comme couleur active pour ce thème.
const babyMint = '#98FFC1'; // Un vert pastel très doux
const activeColor = '#65C387'; // Un vert un peu plus soutenu pour la lisibilité
const inactiveColor = '#B0C4DE'; // Un gris-bleu clair pour l'inactif
const backgroundColor = '#FFFFFF'; // Blanc pur pour un look "propre"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // --- Styles pour le look enfantin ---
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,

        tabBarStyle: {
          backgroundColor: backgroundColor,
          height: 70, // Un peu plus haut pour un effet "costaud"
          paddingBottom: 10, // Marge pour la "home bar" (iPhone)
          paddingTop: 5,
          borderTopWidth: 0, // Enlève la ligne de bordure
          
          // Ombre douce pour un effet "flottant"
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.03, // Très subtile
          shadowRadius: 3,
          elevation: 5, // Pour Android
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600', // Assez lisible
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size ?? 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size ?? 28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size ?? 28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}