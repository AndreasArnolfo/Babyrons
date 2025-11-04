import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Event, BottleEvent, SleepEvent, MedEvent, DiaperEvent, GrowthEvent } from '../data/types';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  event: Event;
  babyName: string;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getEventIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'bottle': return 'water';
    case 'sleep': return 'moon';
    case 'med': return 'medical';
    case 'diaper': return 'shirt';
    case 'growth': return 'trending-up';
    default: return 'ellipse';
  }
}

function getEventDetails(event: Event): string {
  switch (event.type) {
    case 'bottle':
      return `${(event as BottleEvent).ml} ml`;
    case 'sleep':
      const sleepEvent = event as SleepEvent;
      return sleepEvent.duration ? `${Math.floor(sleepEvent.duration / 60000)} min` : 'En cours';
    case 'med':
      return (event as MedEvent).name;
    case 'diaper':
      return (event as DiaperEvent).kind;
    case 'growth':
      const growth = event as GrowthEvent;
      return `${growth.weightKg ? `${growth.weightKg} kg` : ''}`;
    default:
      return '';
  }
}

export function EventCard({ event, babyName }: EventCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={getEventIcon(event.type)} size={24} color={Colors.pastel.mintActive} />
      </View>
      <View style={styles.content}>
        <Text style={styles.babyName}>{babyName}</Text>
        <Text style={styles.details}>{getEventDetails(event)}</Text>
      </View>
      <Text style={styles.time}>{formatTime(event.at)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  babyName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral.charcoal,
    marginBottom: 4,
  },
  details: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
  },
});
