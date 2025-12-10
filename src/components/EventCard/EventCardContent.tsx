import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event, SleepEvent } from '../../data/types';
import { styles } from './styles';
import { getEventIcon, getEventColor, getEventDetails } from './helpers';

interface EventCardContentProps {
  event: Event;
  babyName: string;
  onEndSleep: () => void;
}

export function EventCardContent({ event, babyName, onEndSleep }: EventCardContentProps) {
  const isOngoingSleep = event.type === 'sleep' && !(event as SleepEvent).endAt;

  return (
    <>
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
            onPress={onEndSleep}
            style={styles.endSleepButton}
          >
            <Text style={styles.endSleepButtonText}>Terminer la sieste</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}
