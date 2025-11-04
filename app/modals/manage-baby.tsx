import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';

export default function ManageBabyModal() {
  const router = useRouter();
  const { babies, addBaby, removeBaby } = useBabyStore();
  const [newBabyName, setNewBabyName] = useState('');

  const handleAddBaby = () => {
    if (newBabyName.trim()) {
      addBaby(newBabyName.trim());
      setNewBabyName('');
    }
  };

  const handleRemoveBaby = (id: string, name: string) => {
    Alert.alert(
      'Supprimer le bébé',
      `Êtes-vous sûr de vouloir supprimer ${name} ? Tous les événements associés seront également supprimés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => removeBaby(id),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gérer les bébés</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajouter un bébé</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newBabyName}
            onChangeText={setNewBabyName}
            placeholder="Prénom du bébé"
            placeholderTextColor={Colors.neutral.darkGray}
          />
          <Pressable onPress={handleAddBaby} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bébés existants</Text>
        {babies.length === 0 ? (
          <Text style={styles.emptyText}>
            Aucun bébé ajouté. Commencez par ajouter un bébé ci-dessus.
          </Text>
        ) : (
          babies.map((baby) => (
            <View
              key={baby.id}
              style={[styles.babyCard, { borderLeftColor: baby.color }]}
            >
              <View style={styles.babyInfo}>
                <Text style={styles.babyName}>{baby.name}</Text>
                <Text style={styles.babyDate}>
                  Ajouté le {new Date(baby.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <Pressable
                onPress={() => handleRemoveBaby(baby.id, baby.name)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.neutral.charcoal,
  },
  closeButton: {
    fontSize: FontSize.xl,
    color: Colors.neutral.darkGray,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
  },
  addButton: {
    backgroundColor: Colors.pastel.mintActive,
    borderRadius: BorderRadius.md,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: FontSize.xxl,
    color: Colors.neutral.white,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  babyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.charcoal,
    marginBottom: 4,
  },
  babyDate: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: FontSize.lg,
  },
});
