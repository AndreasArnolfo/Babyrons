import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { Event, BottleEvent, SleepEvent, MedEvent, DiaperEvent, GrowthEvent } from '../data/types';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useBabyStore } from '../state/useBabyStore';

interface EventCardProps {
  event: Event;
  babyName: string;
  allEvents?: Event[]; // Gardé pour compatibilité mais plus utilisé
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeForInput(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseTimeInput(timeStr: string, currentTimestamp: number): number {
  if (!timeStr || timeStr.trim() === '') {
    return currentTimestamp;
  }
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return currentTimestamp;
    }
    const date = new Date(currentTimestamp);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  } catch {
    return currentTimestamp;
  }
}

function formatTimeSince(eventTimestamp: number, currentTime: number = Date.now()): string {
  const diffMs = currentTime - eventTimestamp;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
  
  if (diffHours > 0) {
    return `Il y a ${diffHours}h${diffMinutes > 0 ? `${diffMinutes}min` : ''}`;
  }
  return `Il y a ${diffMinutes} min`;
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

export function EventCard({ event, babyName, allEvents = [] }: EventCardProps) {
  const { updateEvent } = useBabyStore();
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(formatTimeForInput(event.at));
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Rafraîchissement automatique du temps pour les biberons
  useEffect(() => {
    if (event.type !== 'bottle') return;
    
    // Mettre à jour immédiatement
    setCurrentTime(Date.now());
    
    // Mettre à jour toutes les minutes
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 60 secondes
    
    return () => clearInterval(interval);
  }, [event.type, event.at]);
  
  // Pour les biberons, calculer le temps écoulé depuis le timestamp du biberon jusqu'à maintenant
  const timeSinceBottle = event.type === 'bottle' ? formatTimeSince(event.at, currentTime) : null;

  const handleTimePress = () => {
    setIsEditingTime(true);
    setTimeInput(formatTimeForInput(event.at));
  };

  const handleTimeInputChange = (text: string) => {
    // Nettoyer le texte (garder seulement les chiffres et les deux-points)
    let cleaned = text.replace(/[^\d:]/g, '');
    
    // Limiter à 5 caractères max (HH:MM)
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5);
    }
    
    // Ajouter automatiquement les deux-points après 2 chiffres
    if (cleaned.length === 2 && !cleaned.includes(':')) {
      cleaned = cleaned + ':';
    }
    
    setTimeInput(cleaned);
  };

  const handleSaveTime = () => {
    const newTimestamp = parseTimeInput(timeInput, event.at);
    
    // Pour les événements de sommeil, mettre à jour aussi startAt si nécessaire
    if (event.type === 'sleep') {
      const sleepEvent = event as SleepEvent;
      const updates: Partial<SleepEvent> = { at: newTimestamp };
      if (sleepEvent.startAt && sleepEvent.startAt === event.at) {
        updates.startAt = newTimestamp;
      }
      updateEvent(event.id, updates);
    } else {
      updateEvent(event.id, { at: newTimestamp });
    }
    
    setIsEditingTime(false);
  };

  const handleCancel = () => {
    setIsEditingTime(false);
    setTimeInput(formatTimeForInput(event.at));
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name={getEventIcon(event.type)} size={24} color={Colors.pastel.mintActive} />
        </View>
        <View style={styles.content}>
          <Text style={styles.babyName}>{babyName}</Text>
          <Text style={styles.details}>{getEventDetails(event)}</Text>
        </View>
        <Pressable onPress={handleTimePress} style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(event.at)}</Text>
          {event.type === 'bottle' && timeSinceBottle && (
            <Text style={styles.timeSince}>{timeSinceBottle}</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={isEditingTime}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier l'heure</Text>
            <TextInput
              style={styles.timeInput}
              value={timeInput}
              onChangeText={handleTimeInputChange}
              placeholder="HH:MM"
              keyboardType="numeric"
              maxLength={5}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={handleCancel} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable onPress={handleSaveTime} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  timeContainer: {
    alignItems: 'flex-end',
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  timeSince: {
    fontSize: FontSize.xs,
    color: Colors.neutral.darkGray,
    marginTop: 2,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.neutral.lightGray,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.lightGray,
  },
  cancelButtonText: {
    color: Colors.neutral.darkGray,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.pastel.mintActive,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontWeight: '600',
  },
});
