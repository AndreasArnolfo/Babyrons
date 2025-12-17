
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useAppTheme } from '../../src/hooks/useAppTheme';

// --- Palette Pastel "Babyrons" avec style enfantin ---
const activeColor = '#FF6B9D'; // Rose pastel vif et enfantin
const inactiveColor = '#C0C0C0'; // Gris doux pour l'inactif

// Composant d'icône animé
const AnimatedIcon = ({
  IconComponent,
  name,
  nameOutline,
  size,
  color,
  focused
}: {
  IconComponent: any;
  name: string;
  nameOutline: string;
  size: number;
  color: string;
  focused: boolean;
}) => {
  const scale = useSharedValue(focused ? 1 : 0.85);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(focused ? 1 : 0.7);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 200,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSequence(
        withTiming(-8, { duration: 150 }), // Jump up
        withSpring(0, { damping: 8, stiffness: 200 }) // Land softly
      );

      // Animation de rotation subtile pour l'icône de réglages
      if (name === 'cog') {
        rotation.value = withSpring(360, {
          damping: 12,
          stiffness: 120,
        });
      }
    } else {
      scale.value = withTiming(0.85, {
        duration: 200,
      });
      opacity.value = withTiming(0.7, { duration: 200 });
      rotation.value = withTiming(0, {
        duration: 200,
      });
      translateY.value = withTiming(0);
    }
  }, [focused, name, scale, opacity, rotation, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotate: name === 'cog' ? `${rotation.value}deg` : '0deg' },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <IconComponent
        name={focused ? name : nameOutline}
        size={size}
        color={color}
      />
    </Animated.View>
  );
};

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // --- Styles pour le look enfantin ---
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: theme.isDark ? '#718096' : inactiveColor,

        tabBarStyle: {
          backgroundColor: theme.isDark ? theme.colors.surface : '#FFFFFF',
          height: 75, // Plus haut pour un look plus enfantin
          paddingBottom: 20, // Marge pour la "home bar" (iPhone)
          paddingTop: 8,
          borderTopWidth: 2, // Bordure colorée et visible
          borderTopColor: theme.isDark ? theme.colors.border : '#FFE5EC', // Rose très clair

          // Ombre colorée pour un effet enfantin
          shadowColor: theme.isDark ? '#000' : '#FF6B9D',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: theme.isDark ? 0.3 : 0.15, // Plus visible
          shadowRadius: 8,
          elevation: 8, // Pour Android
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700', // Plus gras pour un look enfantin
          marginTop: -2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              IconComponent={MaterialCommunityIcons}
              name="baby-face-outline"
              nameOutline="baby-bottle-outline"
              size={focused ? 32 : 28}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              IconComponent={MaterialCommunityIcons}
              name="book-open-variant"
              nameOutline="book-outline"
              size={focused ? 32 : 28}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              IconComponent={MaterialCommunityIcons}
              name="chart-line-variant"
              nameOutline="chart-line"
              size={focused ? 32 : 28}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon
              IconComponent={MaterialCommunityIcons}
              name="cog"
              nameOutline="cog-outline"
              size={focused ? 32 : 28}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}