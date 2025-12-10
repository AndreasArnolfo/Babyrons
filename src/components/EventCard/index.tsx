import React, { useState } from 'react';
import { View } from 'react-native';
import { Event, SleepEvent } from '../../data/types';
import { useBabyStore } from '../../state/useBabyStore';
import { styles } from './styles';
import { getDeleteMessage } from './helpers';

import { EventCardContent } from './EventCardContent';
import { EventCardActions } from './EventCardActions';
import { EditTimeModal } from './EditTimeModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EndSleepModal } from './EndSleepModal';

interface EventCardProps {
  event: Event;
  babyName: string;
  allEvents?: Event[];
  onDelete?: (id: string) => void;
  showTimeSince?: boolean;
}

export function EventCard({ event, babyName, onDelete, showTimeSince = true }: EventCardProps) {
  const { updateEvent } = useBabyStore();
  
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEndSleepModal, setShowEndSleepModal] = useState(false);

  const handleSaveTime = (newTimestamp: number) => {
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

  const handleSaveEndSleep = (endTime: number) => {
    const sleepEvent = event as SleepEvent;
    const startTime = sleepEvent.startAt || event.at;
    
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
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(event.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <View style={styles.container}>
        <EventCardContent 
          event={event} 
          babyName={babyName} 
          onEndSleep={() => setShowEndSleepModal(true)} 
        />
        <EventCardActions 
          event={event} 
          onTimePress={() => setIsEditingTime(true)}
          onDeletePress={onDelete ? () => setShowDeleteConfirm(true) : undefined}
          showTimeSince={showTimeSince}
        />
      </View>

      <EditTimeModal
        visible={isEditingTime}
        initialTimestamp={event.at}
        onClose={() => setIsEditingTime(false)}
        onSave={handleSaveTime}
      />

      <DeleteConfirmModal
        visible={showDeleteConfirm}
        message={getDeleteMessage(event, babyName)}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Only render EndSleepModal for sleep events to avoid unnecessary logic/rendering */}
      {event.type === 'sleep' && (
        <EndSleepModal
          visible={showEndSleepModal}
          startTime={(event as SleepEvent).startAt || event.at}
          onClose={() => setShowEndSleepModal(false)}
          onSave={handleSaveEndSleep}
        />
      )}
    </>
  );
}
