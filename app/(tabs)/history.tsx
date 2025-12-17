import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useBabyStore } from "../../src/state/useBabyStore";
import { EventCard } from "../../src/components/EventCard";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { groupEventsByDay } from "../../src/utils/date";
import { FadeInEntry } from "../../src/components/common/FadeInEntry";
import { useAppTheme } from "../../src/hooks/useAppTheme";
import { ScalePressable } from "../../src/components/common/ScalePressable";

export default function History() {
  const { babies, events, removeEvent } = useBabyStore();
  const theme = useAppTheme();
  const [visibleDays, setVisibleDays] = useState(7);

  const groupedEvents = useMemo(() => {
    return groupEventsByDay(events);
  }, [events]);

  const groupKeys = Object.keys(groupedEvents);
  const displayedKeys = groupKeys.slice(0, visibleDays);

  const handleLoadMore = () => {
    setVisibleDays((prev) => prev + 7);
  };

  return (
    <PatternBackground>
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.isDark ? theme.colors.surface : Colors.pastel.lavender }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Historique</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {events.length} événement{events.length > 1 ? "s" : ""}
          </Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
          {events.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.cardBg }]}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>Aucun événement</Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Les événements que vous ajoutez apparaîtront ici
              </Text>
            </View>
          ) : (
            <>
              {displayedKeys.map((dateLabel, groupIndex) => (
                <View key={dateLabel} style={styles.groupContainer}>
                  {/* Date Header */}
                  <View style={styles.dateHeader}>
                    <View style={[styles.dateBadge, {
                      backgroundColor: theme.isDark ? theme.colors.surface : 'rgba(255,255,255,0.9)',
                      borderColor: theme.colors.border
                    }]}>
                      <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{dateLabel}</Text>
                    </View>
                  </View>

                  {/* Timeline + Events */}
                  <View style={styles.timelineContainer}>
                    {/* Vertical Line */}
                    <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />

                    {/* Events List */}
                    <View style={styles.eventsList}>
                      {groupedEvents[dateLabel].map((event, index) => {
                        const baby = babies.find((b) => b.id === event.babyId);
                        return (
                          <FadeInEntry
                            key={event.id}
                            delay={index * 50 + groupIndex * 100}
                          >
                            <View style={styles.timelineItem}>
                              {/* Dot on the timeline */}
                              <View style={[
                                styles.timelineDot,
                                {
                                  backgroundColor: baby?.color || Colors.pastel.mint,
                                  borderColor: theme.colors.background
                                }
                              ]} />

                              <EventCard
                                event={event}
                                babyName={baby?.name || "Inconnu"}
                                allEvents={events}
                                onDelete={removeEvent}
                                showTimeSince={false}
                              />
                            </View>
                          </FadeInEntry>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ))}

              {visibleDays < groupKeys.length && (
                <ScalePressable
                  onPress={handleLoadMore}
                  style={[styles.loadMoreButton, { backgroundColor: theme.colors.cardBg }]}
                >
                  <Text style={[styles.loadMoreText, { color: theme.colors.textSecondary }]}>Voir plus</Text>
                </ScalePressable>
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
    backgroundColor: Colors.pastel.lavender,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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
  groupContainer: {
    marginBottom: Spacing.xl,
  },
  dateHeader: {
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  dateText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.neutral.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 20, // Position of the vertical line
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E2E8F0', // Soft gray line
    borderRadius: 1,
  },
  eventsList: {
    flex: 1,
    paddingLeft: 40, // Space for line + dots
  },
  timelineItem: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -25, // Align with line (40 padding - 20 line pos - ~dot radius)
    top: 24, // Vertically align with card center approx
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    zIndex: 1,
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
  loadMoreButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadMoreText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
