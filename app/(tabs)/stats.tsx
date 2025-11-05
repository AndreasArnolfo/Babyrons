import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useBabyStore } from "../../src/state/useBabyStore";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";

export default function Stats() {
  const { babies, events } = useBabyStore();

  const bottleEvents = events.filter((e) => e.type === "bottle");
  const sleepEvents = events.filter((e) => e.type === "sleep");
  const totalBottles = bottleEvents.length;
  const totalSleep = sleepEvents.length;

  return (
    <PatternBackground>
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <Text style={styles.subtitle}>Aperçu de vos données</Text>
      </View>

      <ScrollView style={styles.content}>
        {babies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune donnée</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des bébés et des événements pour voir les statistiques
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{babies.length}</Text>
              <Text style={styles.statLabel}>
                Bébé{babies.length > 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{events.length}</Text>
              <Text style={styles.statLabel}>
                {events.length > 1 ? "Événements totaux" : "Événement total"}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalBottles}</Text>
              <Text style={styles.statLabel}>
                Biberon{totalBottles > 1 ? "s" : ""}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalSleep}</Text>
              <Text style={styles.statLabel}>
                Sieste{totalSleep > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
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
  emptyState: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginTop: Spacing.xl,
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
  statCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.pastel.mintActive,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.lg,
    color: Colors.neutral.darkGray,
  },
});
