import React from 'react';
import { View, Text, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { Colors } from '../../theme/colors';
import { ScalePressable } from '../common/ScalePressable';

interface DeleteConfirmModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ visible, message, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
            {message}
          </Text>
          <Text style={styles.deleteWarningText}>
            Cette action est irréversible.
          </Text>
          <View style={styles.modalButtons}>
            <ScalePressable
              onPress={onClose}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </ScalePressable>
            <ScalePressable
              onPress={onConfirm}
              style={[styles.modalButton, styles.deleteConfirmButton]}
            >
              <Text style={styles.deleteConfirmButtonText}>Supprimer</Text>
            </ScalePressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
