import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
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
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);

  // Filtrer les événements selon le bébé sélectionné
  const filteredEvents = selectedBabyId
    ? events.filter(e => e.babyId === selectedBabyId)
    : events;

  const recentEvents = [...filteredEvents]
    .sort((a, b) => b.at - a.at)
    .slice(0, 10);

  const handleBabyPress = (babyId: string) => {
    // Si on clique sur le même bébé, on désélectionne
    setSelectedBabyId(prev => prev === babyId ? null : babyId);
  };

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

const logo = require("../../assets/images/logo-babyrons.png");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#AAEBA7", // 💚 vert pastel doux
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
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginVertical: Spacing.lg,
    backgroundColor: Colors.neutral.white,
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
  logo: {
    width: 60,       // ✅ adapte selon ton image
    height: 60,
    tintColor: undefined, // garde les vraies couleurs
    backgroundColor: "transparent", // ✅ fond transparent
  },
  babiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
});

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour! 👋</Text>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
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
              <BabyCard 
                key={baby.id} 
                baby={baby} 
                onPress={() => handleBabyPress(baby.id)}
                isSelected={selectedBabyId === baby.id}
              />
            ))
          )}
        </View>
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
              <Pressable 
                onPress={() => setSelectedBabyId(null)}
                style={styles.clearFilterButton}
              >
                <Text style={styles.clearFilterText}>Tous</Text>
              </Pressable>
            )}
          </View>
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
              {selectedBabyId 
                ? `Aucun événement pour ${babies.find(b => b.id === selectedBabyId)?.name || 'ce bébé'}. Ajoutez-en un !`
                : 'Ajoutez votre premier événement pour commencer le suivi'
              }
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
                allEvents={events}
              />
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
