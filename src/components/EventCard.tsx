import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { Event, BottleEvent, SleepEvent, MedEvent, DiaperEvent, GrowthEvent } from '../data/types';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBabyStore } from '../state/useBabyStore';

interface EventCardProps {
  event: Event;
  babyName: string;
  allEvents?: Event[];
  onDelete?: (id: string) => void;
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

function getEventIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type) {
    case 'bottle': return 'baby-bottle';
    case 'sleep': return 'sleep';
    case 'med': return 'pill';
    case 'diaper': return 'emoticon-poop';
    case 'growth': return 'human-male-height';
    default: return 'circle';
  }
}

function getEventColor(type: string): string {
  switch (type) {
    case 'bottle': return Colors.pastel.sky; // Bleu pour le lait
    case 'sleep': return Colors.pastel.lavender; // Violet pour la nuit
    case 'med': return Colors.pastel.rose; // Rose pour les médicaments
    case 'diaper': return '#D4A574'; // Marron clair pour les couches
    case 'growth': return Colors.pastel.mintActive; // Vert pour la croissance
    default: return Colors.neutral.darkGray;
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

function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'bottle': return 'biberon';
    case 'sleep': return 'sieste';
    case 'med': return 'médicament';
    case 'diaper': return 'couche';
    case 'growth': return 'mesure de croissance';
    default: return 'événement';
  }
}

function getDeleteMessage(event: Event, babyName: string): string {
  const eventTypeLabel = getEventTypeLabel(event.type);
  const eventDetails = getEventDetails(event);
  const eventTime = formatTime(event.at);
  
  switch (event.type) {
    case 'bottle':
      return `Supprimer le biberon de ${eventDetails} de ${babyName} à ${eventTime} ?`;
    
    case 'sleep':
      return `Supprimer la sieste de ${eventDetails} de ${babyName} à ${eventTime} ?`;
    
    case 'med':
      return `Supprimer le médicament "${eventDetails}" de ${babyName} à ${eventTime} ?`;
    
    case 'diaper':
      return `Supprimer la couche ${eventDetails.toLowerCase()} de ${babyName} à ${eventTime} ?`;
    
    case 'growth':
      return `Supprimer la mesure de croissance (${eventDetails}) de ${babyName} à ${eventTime} ?`;
    
    default:
      return `Supprimer l'événement de ${babyName} à ${eventTime} ?`;
  }
}

export function EventCard({ event, babyName, allEvents = [], onDelete }: EventCardProps) {
  const { updateEvent } = useBabyStore();
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(formatTimeForInput(event.at));
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEndSleepModal, setShowEndSleepModal] = useState(false);
  const [endTimeInput, setEndTimeInput] = useState('');
  
  // Vérifier si c'est une sieste en cours
  const isOngoingSleep = event.type === 'sleep' && !(event as SleepEvent).endAt;
  
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

  const handleDeletePress = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(event.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEndSleepPress = () => {
    setEndTimeInput('');
    setShowEndSleepModal(true);
  };

  const handleEndTimeInputChange = (text: string) => {
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
    
    setEndTimeInput(cleaned);
  };

  const handleSaveEndSleep = () => {
    const sleepEvent = event as SleepEvent;
    const startTime = sleepEvent.startAt || event.at;
    const endTime = endTimeInput ? parseTimeInput(endTimeInput, Date.now()) : Date.now();
    
    // Vérifier que l'heure de fin est après l'heure de début
    if (endTime <= startTime) {
      // Utiliser l'heure actuelle si l'heure saisie est invalide
      const correctedEndTime = Date.now();
      const duration = correctedEndTime - startTime;
      updateEvent(event.id, {
        endAt: correctedEndTime,
        duration,
      });
    } else {
      const duration = endTime - startTime;
      updateEvent(event.id, {
        endAt: endTime,
        duration,
      });
    }
    
    setShowEndSleepModal(false);
    setEndTimeInput('');
  };

  const handleCancelEndSleep = () => {
    setShowEndSleepModal(false);
    setEndTimeInput('');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={getEventIcon(event.type)} 
            size={24} 
            color={getEventColor(event.type)} 
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.babyName}>{babyName}</Text>
          <Text style={styles.details}>{getEventDetails(event)}</Text>
          {isOngoingSleep && (
            <Pressable 
              onPress={handleEndSleepPress}
              style={styles.endSleepButton}
            >
              <Text style={styles.endSleepButtonText}>Terminer la sieste</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.rightActions}>
          <Pressable onPress={handleTimePress} style={styles.timeContainer}>
            <Text style={styles.time}>{formatTime(event.at)}</Text>
            {event.type === 'bottle' && timeSinceBottle && (
              <Text style={styles.timeSince}>{timeSinceBottle}</Text>
            )}
          </Pressable>

          {onDelete && (
            <Pressable
              onPress={handleDeletePress}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && { opacity: 0.5 }
              ]}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color={Colors.pastel.rose}
              />
            </Pressable>
          )}
        </View>
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

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.deleteIconContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color={Colors.semantic.error}
              />
            </View>
            <Text style={styles.modalTitle}>Supprimer l'événement ?</Text>
            <Text style={styles.deleteConfirmText}>
              {getDeleteMessage(event, babyName)}
            </Text>
            <Text style={styles.deleteWarningText}>
              Cette action est irréversible.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable 
                onPress={handleCancelDelete} 
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable 
                onPress={handleConfirmDelete} 
                style={[styles.modalButton, styles.deleteConfirmButton]}
              >
                <Text style={styles.deleteConfirmButtonText}>Supprimer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEndSleepModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEndSleep}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Terminer la sieste</Text>
            <Text style={styles.helperTextModal}>
              Heure de début : {formatTime((event as SleepEvent).startAt || event.at)}
            </Text>
            <Text style={styles.sectionTitleModal}>Heure de fin (HH:mm)</Text>
            <TextInput
              style={styles.timeInput}
              value={endTimeInput}
              onChangeText={handleEndTimeInputChange}
              placeholder={formatTimeForInput(Date.now())}
              placeholderTextColor={Colors.neutral.darkGray}
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.helperTextModal}>
              Laissez vide pour utiliser l'heure actuelle
            </Text>
            <View style={styles.modalButtons}>
              <Pressable 
                onPress={handleCancelEndSleep} 
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable 
                onPress={handleSaveEndSleep} 
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Terminer</Text>
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  // Added deleteButton style so references to styles.deleteButton are valid
  deleteButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
  deleteIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deleteConfirmText: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 22,
    fontWeight: '600',
  },
  deleteWarningText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  deleteConfirmButton: {
    backgroundColor: Colors.semantic.error,
  },
  deleteConfirmButtonText: {
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  endSleepButton: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.pastel.lavender,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  endSleepButtonText: {
    fontSize: FontSize.xs,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  sectionTitleModal: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral.charcoal,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  helperTextModal: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
});
