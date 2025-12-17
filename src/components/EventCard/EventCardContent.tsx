import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Event, SleepEvent } from '../../data/types';
import { styles } from './styles';
import { getEventIcon, getEventColor, getEventDetails } from './helpers';

interface EventCardContentProps {
  event: Event;
  babyName: string;
  onEndSleep: () => void;
  theme: any; // Using any for simplicity or import return type
}

export function EventCardContent({ event, babyName, onEndSleep, theme }: EventCardContentProps) {
  const isOngoingSleep = event.type === 'sleep' && !(event as SleepEvent).endAt;

  return (
    <>
      <View style={[styles.iconContainer, { backgroundColor: theme.isDark ? theme.colors.background : Colors.modern.background }]}>
        <MaterialCommunityIcons
          name={getEventIcon(event.type)}
          size={24}
          color={getEventColor(event.type)}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.babyName, { color: theme.colors.text }]}>{babyName}</Text>
        <Text style={[styles.details, { color: theme.colors.textSecondary }]}>{getEventDetails(event)}</Text>
        {isOngoingSleep && (
          <Pressable
            onPress={onEndSleep}
            style={[styles.endSleepButton, { borderColor: theme.colors.border, backgroundColor: theme.isDark ? 'transparent' : '#FAF5FF' }]}
          >
            <Text style={styles.endSleepButtonText}>Terminer la sieste</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}
