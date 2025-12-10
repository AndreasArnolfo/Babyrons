import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useBabyStore } from "../../src/state/useBabyStore";
import { BabyCard } from "../../src/components/BabyCard";
import { EventCard } from "../../src/components/EventCard";
import { DashboardSummary } from "../../src/components/DashboardSummary";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { getSupabase } from '@/src/utils/supabase';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRealtimeEvents } from "@/src/hooks/useRealtimeEvents";
import { useRealtimeBabies } from "@/src/hooks/useRealtimeBabies";
import { CuteEmptyState } from "../../src/components/common/CuteEmptyState";
import { ScalePressable } from "../../src/components/common/ScalePressable";
import { FadeInEntry } from "../../src/components/common/FadeInEntry";
import { QuickAddFab } from "../../src/components/QuickAddFab";

function formatDisplayNameFromEmail(email: string): string {
  if (!email) return "";
  const namePart = email.split("@")[0];
  const words = namePart.replace(/[0-9]/g, "").replace(/\./g, " ").split(" ").filter((w) => w.trim() !== "");
  const formatted = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  return formatted;
}

export default function Index() {
  useRealtimeEvents();
  useRealtimeBabies();

  const router = useRouter();
  const { babies, events } = useBabyStore();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return selectedBabyId
      ? events.filter(e => e.babyId === selectedBabyId)
      : events;
  }, [selectedBabyId, events]);

  const recentEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => b.at - a.at)
      .slice(0, 10);
  }, [filteredEvents]);

  // Restored: Logic to calculate which bottles should show "Time Since" (latest only)
  const latestBottleIds = useMemo(() => {
    const ids = new Set<string>();
    const processedBabies = new Set<string>();
    const sortedAllEvents = [...events].sort((a, b) => b.at - a.at);
    for (const event of sortedAllEvents) {
      if (event.type === 'bottle' && !processedBabies.has(event.babyId)) {
        ids.add(event.id);
        processedBabies.add(event.babyId);
      }
    }
    return ids;
  }, [events]);

  const handleBabyPress = (babyId: string) => {
    setSelectedBabyId(prev => prev === babyId ? null : babyId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    useBabyStore.getState().removeEvent(eventId);
  };

  const [displayName, setDisplayName] = useState<string>("");
  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || "";
        const formattedName = formatDisplayNameFromEmail(email);
        setDisplayName(formattedName || "Utilisateur Babyrons");
      } catch (err) {
        console.error("Erreur Supabase:", err);
        setDisplayName("Utilisateur Babyrons");
      }
    })();
  }, []);

  const logo = require("../../assets/images/logo-babyrons.png");
  const insets = useSafeAreaInsets();

  return (
    <PatternBackground>
      <ScrollView style={styles.container}>
        <View style={[styles.headerContainer, { paddingTop: insets.top }]} />
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Bonjour {displayName} !</Text>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <DashboardSummary selectedBabyId={selectedBabyId} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vos bébés</Text>
            <ScalePressable onPress={() => router.push('/modals/manage-baby')}>
              <Text style={styles.manageButton}>Gérer</Text>
            </ScalePressable>
          </View>
          {babies.length === 0 ? (
            <CuteEmptyState
              title="Bienvenue !"
              message="Commencez par ajouter votre premier bébé pour suivre son quotidien."
              icon="baby-face-outline"
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.babiesContainer}
              style={styles.babiesScrollView}
            >
              {babies.map((baby) => (
                <BabyCard
                  key={baby.id}
                  baby={baby}
                  onPress={() => handleBabyPress(baby.id)}
                  isSelected={selectedBabyId === baby.id}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>
                {selectedBabyId
                  ? `Événements - ${babies.find(b => b.id === selectedBabyId)?.name || 'Bébé'}`
                  : 'Événements récents'
                }
              </Text>
              {selectedBabyId && (
                <ScalePressable
                  onPress={() => setSelectedBabyId(null)}
                  style={styles.clearFilterButton}
                >
                  <Text style={styles.clearFilterText}>Tous</Text>
                </ScalePressable>
              )}
            </View>
            {babies.length > 0 && (
              <ScalePressable onPress={() => router.push('/modals/add-event')}>
                <Text style={styles.addButton}>+ Ajouter</Text>
              </ScalePressable>
            )}
          </View>

          {recentEvents.length === 0 ? (
            <CuteEmptyState
              title="C'est calme ici..."
              message={selectedBabyId
                ? "Aucun événement pour ce bébé. Ajoutez un biberon ou un dodo !"
                : "Ajoutez votre premier événement pour commencer le journal de bord."
              }
              icon="book-open-page-variant-outline"
            />
          ) : (
            recentEvents.map((event, index) => {
              const baby = babies.find((b) => b.id === event.babyId);
              return (
                <FadeInEntry key={event.id} delay={index * 100}>
                  <EventCard
                    event={event}
                    babyName={baby?.name || "Inconnu"}
                    onDelete={() => handleDeleteEvent(event.id)}
                    showTimeSince={latestBottleIds.has(event.id)}
                  />
                </FadeInEntry>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Quick Add FAB */}
      <QuickAddFab
        onPressOption={(type) => {
          if (type === 'bottle') {
            router.push({
              pathname: '/modals/quick-bottle',
              params: { babyId: selectedBabyId || '' }
            });
          } else {
            router.push({
              pathname: '/modals/add-event',
              params: {
                type,
                babyId: selectedBabyId || ''
              }
            });
          }
        }}
      />
    </PatternBackground>
  );
}

const styles = StyleSheet.create({
  babiesScrollView: {
    marginHorizontal: -Spacing.lg,
  },
  babiesContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    backgroundColor: "#D6FFD4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#D6FFD4", // 💚 vert pastel doux
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20, // arrondis doux
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2, // effet subtil sur Android
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E50",
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.neutral.charcoal,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.neutral.charcoal,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearFilterButton: {
    marginLeft: Spacing.md,
  },
  clearFilterText: {
    fontSize: FontSize.sm,
    color: Colors.pastel.mintActive,
    fontWeight: "600",
  },
  manageButton: {
    fontSize: FontSize.md,
    color: Colors.pastel.mintActive,
    fontWeight: "600",
  },
  addButton: {
    fontSize: FontSize.md,
    color: Colors.pastel.mintActive,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
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
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginVertical: Spacing.lg,
    backgroundColor: Colors.neutral.white,
  },
  logo: {
    width: 60,
    height: 60,
    tintColor: undefined,
    backgroundColor: "transparent",
  },
});
