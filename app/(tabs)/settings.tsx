import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Switch, Pressable, Alert, ActivityIndicator } from "react-native";
import { useBabyStore } from "../../src/state/useBabyStore";
import { useSupabaseAuth } from "../../src/hooks/useSupabaseAuth";
import { ServiceType } from "../../src/data/types";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { exportDataToPDF } from "../../src/lib/pdfExport";
import { useAppTheme } from "../../src/hooks/useAppTheme";

const serviceLabels: Record<ServiceType, string> = {
  bottle: "🍼 Biberons",
  meal: "🍽️ Repas",
  sleep: "😴 Sommeil",
  med: "💊 Médicaments",
  diaper: "👶 Couches",
  growth: "📏 Croissance",
};

export default function Settings() {
  const { settings, toggleService, updateSettings, babies, events } = useBabyStore();
  const { session, signOut } = useSupabaseAuth();
  const theme = useAppTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBabyIds, setSelectedBabyIds] = useState<Set<string>>(new Set(babies.map(b => b.id)));

  // Mettre à jour les sélections quand les bébés changent
  useEffect(() => {
    const babyIds = new Set(babies.map(b => b.id));
    setSelectedBabyIds(prev => {
      const updated = new Set(prev);
      // Retirer les bébés qui n'existent plus
      Array.from(updated).forEach(id => {
        if (!babyIds.has(id)) updated.delete(id);
      });
      // Ajouter les nouveaux bébés par défaut
      babyIds.forEach(id => {
        if (!updated.has(id)) updated.add(id);
      });
      return updated;
    });
  }, [babies]);

  const toggleBabySelection = (babyId: string) => {
    setSelectedBabyIds(prev => {
      const updated = new Set(prev);
      if (updated.has(babyId)) {
        updated.delete(babyId);
      } else {
        updated.add(babyId);
      }
      return updated;
    });
  };

  const selectAllBabies = () => {
    setSelectedBabyIds(new Set(babies.map(b => b.id)));
  };

  const deselectAllBabies = () => {
    setSelectedBabyIds(new Set());
  };





  const handleExportPDF = async () => {
    if (selectedBabyIds.size === 0) {
      Alert.alert(
        'Aucun bébé sélectionné',
        'Veuillez sélectionner au moins un bébé à exporter.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsExporting(true);
      const selectedBabies = babies.filter(b => selectedBabyIds.has(b.id));
      const selectedEvents = events.filter(e => selectedBabyIds.has(e.babyId));
      await exportDataToPDF(selectedBabies, selectedEvents);
      Alert.alert(
        'Export réussi !',
        'Votre rapport PDF a été généré avec succès.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export PDF.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PatternBackground>
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.isDark ? theme.colors.surface : Colors.pastel.rose }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Réglages</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Personnalisez votre expérience</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apparence</Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              Choisissez le thème de l'application
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {(['auto', 'light', 'dark'] as const).map((mode) => {
                const isActive = (settings.themeMode || 'auto') === mode;
                const label = mode === 'auto' ? 'Auto' : mode === 'light' ? 'Clair' : 'Sombre';
                const icon = mode === 'auto' ? 'brightness-auto' : mode === 'light' ? 'white-balance-sunny' : 'weather-night';

                return (
                  <Pressable
                    key={mode}
                    onPress={() => updateSettings({ themeMode: mode })}
                    style={{
                      flex: 1,
                      backgroundColor: isActive ? Colors.pastel.mintActive : theme.colors.cardBg,
                      borderColor: isActive ? Colors.pastel.mintActive : theme.isDark ? theme.colors.border : Colors.neutral.gray,
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{
                      color: isActive ? '#FFF' : theme.colors.text,
                      fontWeight: isActive ? 'bold' : 'normal'
                    }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Services actifs</Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              Activez ou désactivez les types d'événements que vous souhaitez suivre
            </Text>

            {(Object.keys(serviceLabels) as ServiceType[]).map((service) => (
              <View key={service} style={[styles.settingRow, { backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{serviceLabels[service]}</Text>
                <Switch
                  value={settings.enabledServices.includes(service)}
                  onValueChange={() => toggleService(service)}
                  trackColor={{
                    false: theme.isDark ? theme.colors.border : Colors.neutral.gray,
                    true: Colors.pastel.mintActive,
                  }}
                  thumbColor={Colors.neutral.white}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
              Activer ou désactivez les rappels de biberon et de couche
            </Text>
            <View style={[styles.settingRow, { backgroundColor: theme.colors.cardBg }]}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>🔔 Autoriser les notifications</Text>
              <Switch
                value={settings.notificationsEnabled !== false}
                onValueChange={(value) => {
                  updateSettings({ notificationsEnabled: value });
                  if (!value) {
                    babies.forEach(async (b) => {
                      const { cancelFeedingNotification, cancelDiaperNotification } = await import('../../src/utils/notifications');
                      await cancelFeedingNotification(b.id);
                      await cancelDiaperNotification(b.id);
                    });
                    Alert.alert('Notifications désactivées', 'Tous les rappels programmés ont été annulés.');
                  } else {
                    Alert.alert('Notifications activées', 'Les prochains événements programmeront des rappels.');
                  }
                }}
                trackColor={{
                  false: theme.isDark ? theme.colors.border : Colors.neutral.gray,
                  true: Colors.pastel.mintActive,
                }}
                thumbColor={Colors.neutral.white}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export de données</Text>
            <View style={[styles.exportCard, { backgroundColor: theme.colors.cardBg, borderColor: theme.isDark ? theme.colors.border : Colors.pastel.mintActive }]}>
              <Text style={[styles.exportTitle, { color: theme.colors.text }]}>📄 Exporter en PDF</Text>
              <Text style={[styles.exportDescription, { color: theme.colors.textSecondary }]}>
                Sélectionnez les bébés à inclure dans le rapport PDF
              </Text>

              {babies.length === 0 ? (
                <Text style={[styles.noBabiesText, { color: theme.colors.textSecondary }]}>Aucun bébé enregistré</Text>
              ) : (
                <>
                  <View style={styles.babySelectionActions}>
                    <Pressable onPress={selectAllBabies} style={styles.selectionActionButton}>
                      <Text style={styles.selectionActionText}>Tout sélectionner</Text>
                    </Pressable>
                    <Pressable onPress={deselectAllBabies} style={styles.selectionActionButton}>
                      <Text style={styles.selectionActionText}>Tout désélectionner</Text>
                    </Pressable>
                  </View>

                  <View style={styles.babySelectionList}>
                    {babies.map((baby) => {
                      const isSelected = selectedBabyIds.has(baby.id);
                      return (
                        <Pressable
                          key={baby.id}
                          style={[styles.babySelectionRow, { backgroundColor: theme.colors.cardBg, borderColor: theme.isDark ? theme.colors.border : Colors.neutral.gray }]}
                          onPress={() => toggleBabySelection(baby.id)}
                        >
                          <View style={styles.babySelectionLeft}>
                            <View style={[styles.babyColorIndicator, { backgroundColor: baby.color }]} />
                            <Text style={[styles.babySelectionName, { color: theme.colors.text }]}>{baby.name}</Text>
                          </View>
                          <Switch
                            value={isSelected}
                            onValueChange={() => toggleBabySelection(baby.id)}
                            trackColor={{
                              false: theme.isDark ? theme.colors.border : Colors.neutral.gray,
                              true: Colors.pastel.mintActive,
                            }}
                            thumbColor={Colors.neutral.white}
                          />
                        </Pressable>
                      );
                    })}
                  </View>

                  <Pressable
                    style={[styles.exportButton, (isExporting || selectedBabyIds.size === 0) && styles.exportButtonDisabled]}
                    onPress={handleExportPDF}
                    disabled={isExporting || selectedBabyIds.size === 0}
                  >
                    {isExporting ? (
                      <ActivityIndicator color={Colors.neutral.white} />
                    ) : (
                      <Text style={styles.exportButtonText}>
                        Exporter ({selectedBabyIds.size} bébé{selectedBabyIds.size > 1 ? 's' : ''})
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>À propos</Text>
            <Text style={[styles.aboutText, { backgroundColor: theme.colors.cardBg, color: theme.colors.textSecondary }]}>
              Babyrons v1.0.0 © 2025{'\n'}
              Suivi des bébés pour parents de jumeaux et triplés{'\n'}
              Développé par Andreas Arnolfo & Matthieu Gallice avec ❤️{'\n'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Compte</Text>
            {session ? (
              <View style={[styles.accountCard, { backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.accountEmail, { color: theme.colors.text }]}>{session.user.email}</Text>
                <Pressable style={styles.logoutButton} onPress={signOut}>
                  <Text style={styles.logoutButtonText}>Se déconnecter</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={[styles.aboutText, { backgroundColor: theme.colors.cardBg, color: theme.colors.textSecondary }]}>Non connecté</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: Colors.pastel.rose,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.neutral.darkGray,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingLabel: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
  },
  proCard: {
    backgroundColor: Colors.pastel.mint,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  proTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.sm,
  },
  proDescription: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    marginBottom: Spacing.md,
  },
  proButton: {
    backgroundColor: Colors.pastel.mintActive,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  proButtonText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.neutral.white,
  },
  aboutText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    lineHeight: 20,
  },
  accountCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  accountEmail: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.semantic.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  exportCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.pastel.mintActive,
  },
  exportTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.sm,
  },
  exportDescription: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    marginBottom: Spacing.md,
  },
  exportButton: {
    backgroundColor: Colors.pastel.mintActive,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  noBabiesText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    paddingVertical: Spacing.md,
    fontStyle: 'italic',
  },
  babySelectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  selectionActionButton: {
    flex: 1,
    backgroundColor: Colors.pastel.mint,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  selectionActionText: {
    fontSize: FontSize.sm,
    color: Colors.neutral.charcoal,
    fontWeight: '600',
  },
  babySelectionList: {
    marginBottom: Spacing.md,
  },
  babySelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral.gray,
  },
  babySelectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  babyColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.sm,
  },
  babySelectionName: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    fontWeight: '600',
  },
});