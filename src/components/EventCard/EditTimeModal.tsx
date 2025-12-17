import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal } from 'react-native';
import { styles } from './styles';
import { formatTimeForInput, parseTimeInput } from './helpers';
import { ScalePressable } from '../common/ScalePressable';
import { useAppTheme } from '../../hooks/useAppTheme';

interface EditTimeModalProps {
  visible: boolean;
  initialTimestamp: number;
  onClose: () => void;
  onSave: (newTimestamp: number) => void;
}

export function EditTimeModal({ visible, initialTimestamp, onClose, onSave }: EditTimeModalProps) {
  const [timeInput, setTimeInput] = useState('');
  const theme = useAppTheme();

  useEffect(() => {
    if (visible) {
      setTimeInput(formatTimeForInput(initialTimestamp));
    }
  }, [visible, initialTimestamp]);

  const handleTimeInputChange = (text: string) => {
    let cleaned = text.replace(/[^\d:]/g, '');
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5);
    }
    if (cleaned.length === 2 && !cleaned.includes(':')) {
      cleaned = cleaned + ':';
    }
    setTimeInput(cleaned);
  };

  const handleSave = () => {
    const newTimestamp = parseTimeInput(timeInput, initialTimestamp);
    onSave(newTimestamp);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBg }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Modifier l'heure</Text>
          <TextInput
            style={[styles.timeInput, {
              backgroundColor: theme.isDark ? theme.colors.background : '#F3F4F6',
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            value={timeInput}
            onChangeText={handleTimeInputChange}
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            maxLength={5}
          />
          <View style={styles.modalButtons}>
            <ScalePressable onPress={onClose} style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.isDark ? theme.colors.border : '#F3F4F6' }]}>
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Annuler</Text>
            </ScalePressable>
            <ScalePressable onPress={handleSave} style={[styles.modalButton, styles.saveButton]}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </ScalePressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
