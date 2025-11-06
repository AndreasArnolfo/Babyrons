import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useBabyStore } from "../../src/state/useBabyStore";
import { EventCard } from "../../src/components/EventCard";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";

export default function History() {
  const { babies, events, removeEvent } = useBabyStore();

  const sortedEvents = [...events].sort((a, b) => b.at - a.at);

  return (
    <PatternBackground>
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>
          {sortedEvents.length} événement{sortedEvents.length > 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {sortedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun événement</Text>
            <Text style={styles.emptySubtext}>
              Les événements que vous ajoutez apparaîtront ici
            </Text>
          </View>
        ) : (
          sortedEvents.map((event) => {
            const baby = babies.find((b) => b.id === event.babyId);
            return (
              <EventCard
                key={event.id}
                event={event}
                babyName={baby?.name || "Inconnu"}
                allEvents={events}
                onDelete={removeEvent}
              />
            );
          })
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
    backgroundColor: Colors.pastel.lavender,
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
});
