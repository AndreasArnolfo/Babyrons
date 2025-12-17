import React, { useState, useMemo } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useBabyStore } from "../../src/state/useBabyStore";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { aggregateDailyBottleVolume, extractGrowthData } from "../../src/utils/stats";
import { DailyVolumeChart } from "../../src/components/charts/DailyVolumeChart";
import { GrowthChart } from "../../src/components/charts/GrowthChart";
import { ScalePressable } from "../../src/components/common/ScalePressable";
import { useAppTheme } from "../../src/hooks/useAppTheme";

export default function Stats() {
  const { babies, events } = useBabyStore();
  const theme = useAppTheme();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(
    babies.length > 0 ? babies[0].id : null
  );

  // Sync selected baby if list changes
  React.useEffect(() => {
    if (!selectedBabyId && babies.length > 0) {
      setSelectedBabyId(babies[0].id);
    }
  }, [babies]);

  const selectedBaby = babies.find(b => b.id === selectedBabyId);

  // Computed Data
  const babyEvents = useMemo(() => {
    return selectedBabyId
      ? events.filter(e => e.babyId === selectedBabyId)
      : [];
  }, [events, selectedBabyId]);

  const volumeData = useMemo(() => aggregateDailyBottleVolume(babyEvents), [babyEvents]);
  const weightData = useMemo(() => extractGrowthData(babyEvents, 'weight'), [babyEvents]);
  const heightData = useMemo(() => extractGrowthData(babyEvents, 'height'), [babyEvents]);

  return (
    <PatternBackground>
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.isDark ? theme.colors.surface : Colors.pastel.sky }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Statistiques</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Suivi de la courbe et des repas</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          {babies.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.cardBg }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Aucune donnée</Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Ajoutez un bébé pour voir ses statistiques
              </Text>
            </View>
          ) : (
            <>
              {/* Baby Selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorContainer}
                contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
              >
                {babies.map(baby => (
                  <ScalePressable
                    key={baby.id}
                    onPress={() => setSelectedBabyId(baby.id)}
                    style={[
                      styles.babyChip,
                      {
                        backgroundColor: selectedBabyId === baby.id
                          ? (theme.isDark ? theme.colors.text : Colors.neutral.charcoal)
                          : theme.colors.surface,
                        borderColor: baby.color
                      }
                    ]}
                  >
                    <Text style={[
                      styles.babyChipText,
                      {
                        color: selectedBabyId === baby.id
                          ? (theme.isDark ? theme.colors.background : Colors.neutral.white)
                          : theme.colors.text
                      }
                    ]}>
                      {baby.name}
                    </Text>
                  </ScalePressable>
                ))}
              </ScrollView>

              {selectedBaby && (
                <View style={styles.chartsContainer}>
                  <DailyVolumeChart data={volumeData} />
                  <GrowthChart data={weightData} type="weight" baby={selectedBaby} />
                  <GrowthChart data={heightData} type="height" baby={selectedBaby} />
                </View>
              )}
            </>
          )}
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
    backgroundColor: Colors.pastel.sky,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
    zIndex: 50, // Modified: Header on top
    elevation: 50,
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
    flex: 1,
    zIndex: 1, // Modified: Content below header
    elevation: 1,
    overflow: 'visible',
    marginTop: Spacing.xxl,
  },
  selectorContainer: {
    marginTop: -24, // Overlap header
    marginBottom: Spacing.lg,
    flexGrow: 0,
    zIndex: 20, // Even higher for the selector
    elevation: 20, // High elevation for Android
    paddingTop: Spacing.sm,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  babyChip: {
    backgroundColor: Colors.neutral.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8, // Solid elevation
  },
  babyChipActive: {
    backgroundColor: Colors.neutral.charcoal,
    borderColor: Colors.neutral.charcoal,
  },
  babyChipText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral.charcoal,
  },
  babyChipTextActive: {
    color: Colors.neutral.white,
  },
  chartsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    margin: Spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.neutral.darkGray,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
    textAlign: "center",
  },
});
