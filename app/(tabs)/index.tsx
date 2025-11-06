import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useBabyStore } from "../../src/state/useBabyStore";
import { BabyCard } from "../../src/components/BabyCard";
import { EventCard } from "../../src/components/EventCard";
import { PatternBackground } from "../../src/components/PatternBackground";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { getSupabase } from '@/src/utils/supabase';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert } from "react-native";

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

  const handleDeleteEvent = async (eventId: string) => {
    const supabase = getSupabase();

    if (!supabase) {
      console.error("Supabase non configuré (variables manquantes)");
      Alert.alert("Erreur", "Impossible de supprimer l'événement : Supabase non configuré.");
      return;
    }

    console.log("🗑 Tentative suppression event :", eventId);

    const { data, error } = await supabase
      .from("events")        // ✅ une seule table
      .delete()
      .eq("id", eventId)
      .select();

    if (error) {
      console.error("❌ Erreur Supabase :", error.message);
      Alert.alert("Erreur", "Impossible de supprimer l'événement : " + error.message);
    } else {
      console.log("✅ Événement supprimé :", data);
      useBabyStore.getState().removeEvent(eventId);
    }
  };

  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Supabase non configuré (variables manquantes)');
        return;
      }
      // try to fetch authenticated user from Supabase and set display name
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const user = userData?.user;
        const email = user?.email || "";
        setDisplayName(email ? email.split("@")[0] : "");

        const { data, error } = await supabase.from('test').select('*').limit(1);
        console.log('Supabase OK?', !!data && !error && !userError, (error || userError)?.message);
      } catch (err) {
        console.log('Erreur Supabase:', err);
      }
    })();
  }, []);
const logo = require("../../assets/images/logo-babyrons.png");
const insets = useSafeAreaInsets();
  return (
    <PatternBackground>
      <ScrollView style={styles.container}>
      <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top }, // ✅ marge dynamique selon appareil
      ]}
      ></View>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour {displayName} !</Text>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos bébés</Text>
          <Pressable onPress={() => router.push('/modals/manage-baby')}>
            <Text style={styles.manageButton}>Gérer</Text>
          </Pressable>
        </View>
        {babies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun bébé ajouté</Text>
            <Text style={styles.emptySubtext}>
              Appuyez sur "Gérer" pour ajouter votre premier bébé
            </Text>
          </View>
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
                onDelete={() => handleDeleteEvent(event.id)}
              />
            );
          })
        )}
      </View>
    </ScrollView>
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
  // container for the section title and optional clear button
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  // button to clear the baby filter
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
    width: 60,       // ✅ adapte selon ton image
    height: 60,
    tintColor: undefined, // garde les vraies couleurs
    backgroundColor: "transparent", // ✅ fond transparent
  },
});
