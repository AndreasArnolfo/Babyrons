import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { ServiceType } from '../../src/data/types';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';

export default function AddEventModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialType = (params.type as ServiceType) || null;
  const initialBabyId = (params.babyId as string) || '';

  const { babies, addEvent, removeEvent, settings, events } = useBabyStore();
  const [selectedBaby, setSelectedBaby] = useState<string>(initialBabyId);
  const [eventType, setEventType] = useState<ServiceType>(
    initialType && settings.enabledServices.includes(initialType)
      ? initialType
      : settings.enabledServices[0] || 'bottle'
  );

  // États pour biberon
  const [bottleMl, setBottleMl] = useState('');
  const [bottleKind, setBottleKind] = useState<'breastmilk' | 'formula' | 'mixed'>('formula');

  // États pour sommeil
  const [sleepStartAt, setSleepStartAt] = useState<string>('');
  const [sleepEndAt, setSleepEndAt] = useState<string>('');
  const [isSleepOngoing, setIsSleepOngoing] = useState(false);

  // États pour médicament
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medNote, setMedNote] = useState('');

  // États pour couche
  const [diaperKind, setDiaperKind] = useState<'wet' | 'dirty' | 'both'>('both');

  // États pour croissance
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('');

  React.useEffect(() => {
    if (!settings.enabledServices.includes(eventType)) {
      setEventType(settings.enabledServices[0] || 'bottle');
    }
  }, [settings.enabledServices, eventType]);

  // Vérifier s'il y a une sieste en cours pour ce bébé
  React.useEffect(() => {
    if (eventType === 'sleep' && selectedBaby) {
      const ongoingSleep = events
        .filter(e => e.type === 'sleep' && e.babyId === selectedBaby)
        .find(e => {
          const sleepEvent = e as any;
          return sleepEvent.startAt && !sleepEvent.endAt;
        });
      setIsSleepOngoing(!!ongoingSleep);
    } else {
      setIsSleepOngoing(false);
    }
  }, [eventType, selectedBaby, events]);

  const formatTimeForInput = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseTimeInput = (timeStr: string): number => {
    if (!timeStr || timeStr.trim() === '') {
      return Date.now();
    }
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return Date.now();
      }
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      return date.getTime();
    } catch {
      return Date.now();
    }
  };

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
        if (!bottleMl || parseInt(bottleMl) <= 0) return;
        addEvent({
          ...baseEvent,
          type: 'bottle',
          ml: parseInt(bottleMl),
          kind: bottleKind,
        });
        break;

      case 'sleep':
        if (isSleepOngoing) {
          // Terminer une sieste en cours
          const ongoingSleep = events
            .filter(e => e.type === 'sleep' && e.babyId === selectedBaby)
            .find(e => {
              const sleepEvent = e as any;
              return sleepEvent.startAt && !sleepEvent.endAt;
            });

          if (ongoingSleep) {
            const endTime = sleepEndAt ? parseTimeInput(sleepEndAt) : Date.now();
            const startTime = (ongoingSleep as any).startAt;
            const duration = endTime - startTime;

            // Mettre à jour l'événement existant
            removeEvent(ongoingSleep.id);
            addEvent({
              ...baseEvent,
              type: 'sleep',
              startAt: startTime,
              endAt: endTime,
              duration,
            });
          } else {
            // Si la sieste en cours n'a pas été trouvée, créer un nouveau début
            const startTime = Date.now();
            addEvent({
              ...baseEvent,
              type: 'sleep',
              startAt: startTime,
              at: startTime,
            });
          }
        } else {
          // Nouveau début de sieste (avec ou sans heure de fin)
          const startTime = sleepStartAt ? parseTimeInput(sleepStartAt) : Date.now();
          const endTime = sleepEndAt ? parseTimeInput(sleepEndAt) : undefined;

          // Si une heure de fin est fournie, calculer la durée
          const duration = endTime ? endTime - startTime : undefined;

          // Vérifier que l'heure de fin est après l'heure de début
          if (endTime && endTime <= startTime) {
            // Afficher une erreur ou utiliser l'heure actuelle comme fin
            const correctedEndTime = Date.now();
            addEvent({
              ...baseEvent,
              type: 'sleep',
              startAt: startTime,
              endAt: correctedEndTime,
              duration: correctedEndTime - startTime,
              at: startTime,
            });
          } else {
            addEvent({
              ...baseEvent,
              type: 'sleep',
              startAt: startTime,
              endAt: endTime,
              duration,
              at: startTime,
            });
          }
        }
        break;

      case 'diaper':
        addEvent({
          ...baseEvent,
          type: 'diaper',
          kind: diaperKind,
        });
        break;

      case 'med':
        if (!medName.trim()) return;
        addEvent({
          ...baseEvent,
          type: 'med',
          name: medName.trim(),
          dose: medDose.trim() || undefined,
          note: medNote.trim() || undefined,
        });
        break;

      case 'growth':
        const weight = weightKg ? parseFloat(weightKg) : undefined;
        const height = heightCm ? parseFloat(heightCm) : undefined;
        const head = headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined;

        if (!weight && !height && !head) return;

        addEvent({
          ...baseEvent,
          type: 'growth',
          weightKg: weight,
          heightCm: height,
          headCircumferenceCm: head,
        });
        break;
    }

    router.back();
  };

  const canSave = () => {
    if (!selectedBaby || !settings.enabledServices.includes(eventType)) return false;

    switch (eventType) {
      case 'bottle':
        const ml = parseInt(bottleMl);
        return bottleMl.length > 0 && !isNaN(ml) && ml > 0;
      case 'sleep':
        // Peut toujours démarrer ou terminer une sieste
        return true;
      case 'med':
        return medName.trim().length > 0;
      case 'growth':
        // Vérifier qu'au moins un champ est rempli et contient un nombre valide
        const weightVal = weightKg ? parseFloat(weightKg) : undefined;
        const heightVal = heightCm ? parseFloat(heightCm) : undefined;
        const headVal = headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined;
        // Au moins un nombre valide (pas NaN)
        return (weightVal !== undefined && !isNaN(weightVal)) ||
          (heightVal !== undefined && !isNaN(heightVal)) ||
          (headVal !== undefined && !isNaN(headVal));
      case 'diaper':
        return true; // Toujours valide
      default:
        return true;
    }
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

      {/* Formulaire Biberon */}
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
          <Text style={styles.sectionTitle}>Type de lait</Text>
          <View style={styles.radioGroup}>
            <Pressable
              onPress={() => setBottleKind('formula')}
              style={[
                styles.radioOption,
                bottleKind === 'formula' && styles.radioSelected,
              ]}
            >
              <Text style={styles.radioText}>🥛 Préparation</Text>
            </Pressable>
            <Pressable
              onPress={() => setBottleKind('breastmilk')}
              style={[
                styles.radioOption,
                bottleKind === 'breastmilk' && styles.radioSelected,
              ]}
            >
              <Text style={styles.radioText}>🍼 Lait maternel</Text>
            </Pressable>
            <Pressable
              onPress={() => setBottleKind('mixed')}
              style={[
                styles.radioOption,
                bottleKind === 'mixed' && styles.radioSelected,
              ]}
            >
              <Text style={styles.radioText}>🥛🍼 Mixte</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Formulaire Sommeil */}
      {eventType === 'sleep' && (
        <View style={styles.section}>
          {isSleepOngoing ? (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💤 Une sieste est en cours pour ce bébé
                </Text>
              </View>
              <Text style={styles.sectionTitle}>Heure de fin (HH:mm)</Text>
              <TextInput
                style={styles.input}
                value={sleepEndAt}
                onChangeText={setSleepEndAt}
                placeholder={formatTimeForInput(Date.now())}
                placeholderTextColor={Colors.neutral.darkGray}
              />
              <Text style={styles.helperText}>
                Laissez vide pour utiliser l'heure actuelle
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Heure de début (HH:mm)</Text>
              <TextInput
                style={styles.input}
                value={sleepStartAt}
                onChangeText={setSleepStartAt}
                placeholder={formatTimeForInput(Date.now())}
                placeholderTextColor={Colors.neutral.darkGray}
              />
              <Text style={styles.helperText}>
                Laissez vide pour utiliser l'heure actuelle
              </Text>
              <Text style={styles.sectionTitle}>Heure de fin (HH:mm) - Optionnel</Text>
              <TextInput
                style={styles.input}
                value={sleepEndAt}
                onChangeText={setSleepEndAt}
                placeholder="Laissez vide pour une sieste en cours"
                placeholderTextColor={Colors.neutral.darkGray}
              />
              <Text style={styles.helperText}>
                Remplissez pour créer une sieste complète avec début et fin
              </Text>
            </>
          )}
        </View>
      )}

      {/* Formulaire Couche */}
      {eventType === 'diaper' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de couche</Text>
          <View style={styles.radioGroup}>
            <Pressable
              onPress={() => setDiaperKind('wet')}
              style={[
                styles.radioOption,
                diaperKind === 'wet' && styles.radioSelected,
              ]}
            >
              <Text style={styles.radioText}>💧 Mouillée</Text>
            </Pressable>
            <Pressable
              onPress={() => setDiaperKind('dirty')}
              style={[
                styles.radioOption,
                diaperKind === 'dirty' && styles.radioSelected,
              ]}
            >
              <Text style={styles.radioText}>💩 Sale</Text>
            </Pressable>
            <Pressable
              onPress={() => setDiaperKind('both')}
              style={[
                styles.radioOption,
                diaperKind === 'both' && styles.radioSelected,
              ]}
            >
              <Text style={styles.radioText}>💧💩 Les deux</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Formulaire Médicament */}
      {eventType === 'med' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nom du médicament *</Text>
          <TextInput
            style={styles.input}
            value={medName}
            onChangeText={setMedName}
            placeholder="Vitamine D"
            placeholderTextColor={Colors.neutral.darkGray}
          />
          <Text style={styles.sectionTitle}>Dose (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={medDose}
            onChangeText={setMedDose}
            placeholder="1 goutte"
            placeholderTextColor={Colors.neutral.darkGray}
          />
          <Text style={styles.sectionTitle}>Note (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={medNote}
            onChangeText={setMedNote}
            placeholder="Note supplémentaire..."
            placeholderTextColor={Colors.neutral.darkGray}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Formulaire Croissance */}
      {eventType === 'growth' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Poids (kg)</Text>
          <TextInput
            style={styles.input}
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
            placeholder="3.5"
            placeholderTextColor={Colors.neutral.darkGray}
          />
          <Text style={styles.sectionTitle}>Taille (cm)</Text>
          <TextInput
            style={styles.input}
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="decimal-pad"
            placeholder="50"
            placeholderTextColor={Colors.neutral.darkGray}
          />
          <Text style={styles.sectionTitle}>Périmètre crânien (cm)</Text>
          <TextInput
            style={styles.input}
            value={headCircumferenceCm}
            onChangeText={setHeadCircumferenceCm}
            keyboardType="decimal-pad"
            placeholder="35"
            placeholderTextColor={Colors.neutral.darkGray}
          />
          <Text style={styles.helperText}>
            Remplissez au moins un champ
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleSave}
        style={[
          styles.saveButton,
          !canSave() && styles.saveButtonDisabled
        ]}
        disabled={!canSave()}
      >
        <Text style={styles.saveButtonText}>
          {eventType === 'sleep' && isSleepOngoing ? 'Terminer la sieste' : 'Enregistrer'}
        </Text>
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
    marginTop: 30,
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
  radioGroup: {
    // gap n'est pas supporté dans React Native, utiliser marginBottom sur les enfants
  },
  radioOption: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.neutral.gray,
  },
  radioSelected: {
    borderColor: Colors.pastel.mintActive,
    backgroundColor: Colors.pastel.mint + '20',
  },
  radioText: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
  },
  infoBox: {
    backgroundColor: Colors.pastel.sky,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    fontWeight: '600',
  },
  helperText: {
    fontSize: FontSize.xs,
    color: Colors.neutral.darkGray,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
