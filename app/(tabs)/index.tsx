import React, { useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useBabyStore } from "../../src/state/useBabyStore";
import { BabyCard } from "../../src/components/BabyCard";
import { EventCard } from "../../src/components/EventCard";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { getSupabase } from '@/src/utils/supabase';

export default function Index() {
  const router = useRouter();
  const { babies, events } = useBabyStore();

  const recentEvents = [...events]
    .sort((a, b) => b.at - a.at)
    .slice(0, 10);

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Supabase non configuré (variables manquantes)');
        return;
      }
      const { data, error } = await supabase.from('test').select('*').limit(1);
      console.log('Supabase OK?', !!data && !error, error?.message);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour! 👋</Text>
          <Text style={styles.title}>Babyrons</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos bébés</Text>
          <Pressable onPress={() => router.push('/modals/manage-baby')}>
            <Text style={styles.manageButton}>Gérer</Text>
          </Pressable>
        </View>
        <View style={styles.babiesContainer}>
          {babies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun bébé ajouté</Text>
              <Text style={styles.emptySubtext}>
                Appuyez sur "Gérer" pour ajouter votre premier bébé
              </Text>
            </View>
          ) : (
            babies.map((baby) => (
              <BabyCard key={baby.id} baby={baby} />
            ))
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements récents</Text>
          {babies.length > 0 && (
            <Pressable onPress={() => router.push('/modals/add-event')}>
              <Text style={styles.addButton}>+ Ajouter</Text>
            </Pressable>
          )}
        </View>

        {recentEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun événement</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez votre premier événement pour commencer le suivi
            </Text>
          </View>
        ) : (
          recentEvents.map((event) => {
            const baby = babies.find((b) => b.id === event.babyId);
            return (
              <EventCard
                key={event.id}
                event={event}
                babyName={baby?.name || "Inconnu"}
              />
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  babiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  header: {
    backgroundColor: Colors.pastel.mint,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.xs,
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
});
