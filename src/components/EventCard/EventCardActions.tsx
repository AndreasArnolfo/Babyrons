import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event } from '../../data/types';
import { styles } from './styles';
import { formatTime, formatTimeSince } from './helpers';
import { Colors } from '../../theme/colors';
import { ScalePressable } from '../common/ScalePressable';
import { ActionSheet, Action } from '../common/ActionSheet';

interface EventCardActionsProps {
  event: Event;
  onTimePress: () => void;
  onDeletePress?: () => void;
  showTimeSince?: boolean;
  theme: any;
}

export function EventCardActions({ event, onTimePress, onDeletePress, showTimeSince = true, theme }: EventCardActionsProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showActionSheet, setShowActionSheet] = useState(false);

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

  const timeSinceBottle = event.type === 'bottle' ? formatTimeSince(event.at, currentTime) : null;

  const actions: Action[] = [
    {
      id: 'edit',
      label: "Modifier l'heure",
      icon: 'clock-outline',
      onPress: onTimePress,
    },
    ...(onDeletePress ? [{
      id: 'delete',
      label: 'Supprimer',
      icon: 'trash-can-outline' as const,
      onPress: onDeletePress,
      destructive: true,
    }] : []),
  ];

  return (
    <>
      <View style={styles.rightActions}>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>{formatTime(event.at)}</Text>
          {event.type === 'bottle' && showTimeSince && timeSinceBottle && (
            <Text style={[styles.timeSince, { color: theme.colors.textSecondary }]}>{timeSinceBottle}</Text>
          )}
        </View>

        <ScalePressable
          onPress={() => setShowActionSheet(true)}
          style={{ padding: 8 }}
        >
          <MaterialCommunityIcons
            name="dots-vertical"
            size={22}
            color={theme.colors.textSecondary}
          />
        </ScalePressable>
      </View>

      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        actions={actions}
      />
    </>
  );
}
