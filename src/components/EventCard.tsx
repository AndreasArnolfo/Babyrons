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
      const bottle = event as BottleEvent;
      const kindLabels = {
        breastmilk: 'lait maternel',
        formula: 'préparation',
        mixed: 'mixte',
      };
      const kindLabel = bottle.kind ? ` (${kindLabels[bottle.kind]})` : '';
      return `${bottle.ml} ml${kindLabel}`;
    
    case 'sleep':
      const sleepEvent = event as SleepEvent;
      if (sleepEvent.duration) {
        const hours = Math.floor(sleepEvent.duration / 3600000);
        const minutes = Math.floor((sleepEvent.duration % 3600000) / 60000);
        if (hours > 0) {
          return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`;
        }
        return `${minutes} min`;
      }
      return 'En cours';
    
    case 'med':
      const medEvent = event as MedEvent;
      let medDetails = medEvent.name;
      if (medEvent.dose) {
        medDetails += ` - ${medEvent.dose}`;
      }
      return medDetails;
    
    case 'diaper':
      const diaperEvent = event as DiaperEvent;
      const diaperLabels = {
        wet: 'Mouillée',
        dirty: 'Sale',
        both: 'Les deux',
      };
      return diaperLabels[diaperEvent.kind] || diaperEvent.kind;
    
    case 'growth':
      const growth = event as GrowthEvent;
      const parts: string[] = [];
      if (growth.weightKg) parts.push(`${growth.weightKg} kg`);
      if (growth.heightCm) parts.push(`${growth.heightCm} cm`);
      if (growth.headCircumferenceCm) parts.push(`PC: ${growth.headCircumferenceCm} cm`);
      return parts.join(' • ') || 'Mesures';
    
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
