import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event } from '../../data/types';
import { styles } from './styles';
import { formatTime, formatTimeSince } from './helpers';
import { Colors } from '../../theme/colors';
import { ScalePressable } from '../common/ScalePressable';

interface EventCardActionsProps {
  event: Event;
  onTimePress: () => void;
  onDeletePress?: () => void;
  showTimeSince?: boolean;
}

export function EventCardActions({ event, onTimePress, onDeletePress, showTimeSince = true }: EventCardActionsProps) {
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

  const timeSinceBottle = event.type === 'bottle' ? formatTimeSince(event.at, currentTime) : null;

  return (
    <View style={styles.rightActions}>
      <ScalePressable onPress={onTimePress} style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(event.at)}</Text>
        {event.type === 'bottle' && showTimeSince && timeSinceBottle && (
          <Text style={styles.timeSince}>{timeSinceBottle}</Text>
        )}
      </ScalePressable>

      {onDeletePress && (
        <ScalePressable
          onPress={onDeletePress}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color={Colors.pastel.rose}
          />
        </ScalePressable>
      )}
    </View>
  );
}
