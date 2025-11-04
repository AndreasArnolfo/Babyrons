import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Baby } from '../data/types';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';

interface BabyCardProps {
  baby: Baby;
  onPress?: () => void;
}

export function BabyCard({ baby, onPress }: BabyCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: baby.color },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{baby.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👶</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral.charcoal,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FontSize.lg,
  },
});
