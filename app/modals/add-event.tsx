import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { ServiceType } from '../../src/data/types';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';

export default function AddEventModal() {
  const router = useRouter();
  const { babies, addEvent, settings } = useBabyStore();
  const [selectedBaby, setSelectedBaby] = useState<string>('');
  const [eventType, setEventType] = useState<ServiceType>(
    settings.enabledServices[0] || 'bottle'
  );
  const [bottleMl, setBottleMl] = useState('');

  React.useEffect(() => {
    if (!settings.enabledServices.includes(eventType)) {
      setEventType(settings.enabledServices[0] || 'bottle');
    }
  }, [settings.enabledServices, eventType]);

  const handleSave = () => {
    if (!selectedBaby) return;
    if (!settings.enabledServices.includes(eventType)) return;

    const baseEvent = {
      babyId: selectedBaby,
      type: eventType,
      at: Date.now(),
    };

    switch (eventType) {
      case 'bottle':
        addEvent({
          ...baseEvent,
          type: 'bottle',
          ml: parseInt(bottleMl) || 0,
        });
        break;
      case 'sleep':
        addEvent({
          ...baseEvent,
          type: 'sleep',
          startAt: Date.now(),
        });
        break;
      case 'diaper':
        addEvent({
          ...baseEvent,
          type: 'diaper',
          kind: 'both',
        });
        break;
      case 'med':
        addEvent({
          ...baseEvent,
          type: 'med',
          name: 'Vitamine D',
        });
        break;
      case 'growth':
        addEvent({
          ...baseEvent,
          type: 'growth',
        });
        break;
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajouter un événement</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sélectionner un bébé</Text>
        {babies.map((baby) => (
          <Pressable
            key={baby.id}
            onPress={() => setSelectedBaby(baby.id)}
            style={[
              styles.option,
              { borderColor: baby.color },
              selectedBaby === baby.id && styles.selectedOption,
            ]}
          >
            <Text style={styles.optionText}>{baby.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type d'événement</Text>
        {settings.enabledServices.length === 0 ? (
          <Text style={styles.emptyServicesText}>
            Aucun service activé. Activez des services dans les réglages pour ajouter des événements.
          </Text>
        ) : (
          settings.enabledServices.map((service) => (
            <Pressable
              key={service}
              onPress={() => setEventType(service)}
              style={[
                styles.option,
                eventType === service && styles.selectedOption,
              ]}
            >
              <Text style={styles.optionText}>
                {service === 'bottle' ? '🍼 Biberon' :
                 service === 'sleep' ? '😴 Sommeil' :
                 service === 'med' ? '💊 Médicament' :
                 service === 'diaper' ? '👶 Couche' :
                 '📏 Croissance'}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      {eventType === 'bottle' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantité (ml)</Text>
          <TextInput
            style={styles.input}
            value={bottleMl}
            onChangeText={setBottleMl}
            keyboardType="numeric"
            placeholder="120"
          />
        </View>
      )}

      <Pressable 
        onPress={handleSave} 
        style={[
          styles.saveButton,
          (settings.enabledServices.length === 0 || !selectedBaby) && styles.saveButtonDisabled
        ]}
        disabled={settings.enabledServices.length === 0 || !selectedBaby}
      >
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </Pressable>
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
  option: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: Colors.pastel.mintActive,
    backgroundColor: Colors.pastel.mint + '20',
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
  },
  saveButton: {
    backgroundColor: Colors.pastel.mintActive,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.neutral.gray,
    opacity: 0.5,
  },
  emptyServicesText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
  },
});
