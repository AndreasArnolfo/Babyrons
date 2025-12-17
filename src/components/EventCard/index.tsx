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
import { useAppTheme } from '../../hooks/useAppTheme';

interface EventCardProps {
  event: Event;
  babyName: string;
  allEvents?: Event[];
  onDelete?: (id: string) => void;
  showTimeSince?: boolean;
}

export function EventCard({ event, babyName, onDelete, showTimeSince = true }: EventCardProps) {
  const { updateEvent } = useBabyStore();
  const theme = useAppTheme();

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEndSleepModal, setShowEndSleepModal] = useState(false);

  const handleSaveTime = (newTimestamp: number) => {
    updateEvent(event.id, { at: newTimestamp });
    setIsEditingTime(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(event.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleSaveEndSleep = (endAt: number) => {
    updateEvent(event.id, { endAt });
    setShowEndSleepModal(false);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border, borderWidth: theme.isDark ? 1 : 0 }]}>
        <EventCardContent
          event={event}
          babyName={babyName}
          onEndSleep={() => setShowEndSleepModal(true)}
          theme={theme}
        />
        <EventCardActions
          event={event}
          onTimePress={() => setIsEditingTime(true)}
          onDeletePress={onDelete ? () => setShowDeleteConfirm(true) : undefined}
          showTimeSince={showTimeSince}
          theme={theme}
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
