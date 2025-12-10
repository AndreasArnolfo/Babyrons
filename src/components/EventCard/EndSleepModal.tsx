import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { styles } from './styles';
import { formatTime, formatTimeForInput, parseTimeInput } from './helpers';
import { Colors } from '../../theme/colors';

interface EndSleepModalProps {
  visible: boolean;
  startTime: number;
  onClose: () => void;
  onSave: (endTime: number) => void;
}

export function EndSleepModal({ visible, startTime, onClose, onSave }: EndSleepModalProps) {
  const [endTimeInput, setEndTimeInput] = useState('');

  const handleEndTimeInputChange = (text: string) => {
    let cleaned = text.replace(/[^\d:]/g, '');
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5);
    }
    if (cleaned.length === 2 && !cleaned.includes(':')) {
      cleaned = cleaned + ':';
    }
    setEndTimeInput(cleaned);
  };

  const handleSave = () => {
    const endTime = endTimeInput ? parseTimeInput(endTimeInput, Date.now()) : Date.now();
    onSave(endTime);
    setEndTimeInput(''); // Reset after save
  };

  const handleCancel = () => {
    setEndTimeInput('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Terminer la sieste</Text>
          <Text style={styles.helperTextModal}>
            Heure de début : {formatTime(startTime)}
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
              onPress={handleCancel} 
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
            <Pressable 
              onPress={handleSave} 
              style={[styles.modalButton, styles.saveButton]}
            >
              <Text style={styles.saveButtonText}>Terminer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
