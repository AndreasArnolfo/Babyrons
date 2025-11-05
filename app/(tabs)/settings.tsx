import React from "react";
import { ScrollView, View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { useBabyStore } from "../../src/state/useBabyStore";
import { useSupabaseAuth } from "../../src/hooks/useSupabaseAuth";
import { ServiceType } from "../../src/data/types";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";

const serviceLabels: Record<ServiceType, string> = {
  bottle: "🍼 Biberons",
  sleep: "😴 Sommeil",
  med: "💊 Médicaments",
  diaper: "👶 Couches",
  growth: "📏 Croissance",
};

export default function Settings() {
  const { settings, toggleService, updateSettings } = useBabyStore();
  const { session, signOut } = useSupabaseAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réglages</Text>
        <Text style={styles.subtitle}>Personnalisez votre expérience</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services actifs</Text>
          <Text style={styles.sectionDescription}>
            Activez ou désactivez les types d'événements que vous souhaitez suivre
          </Text>

          {(Object.keys(serviceLabels) as ServiceType[]).map((service) => (
            <View key={service} style={styles.settingRow}>
              <Text style={styles.settingLabel}>{serviceLabels[service]}</Text>
              <Switch
                value={settings.enabledServices.includes(service)}
                onValueChange={() => toggleService(service)}
                trackColor={{
                  false: Colors.neutral.gray,
                  true: Colors.pastel.mintActive,
                }}
                thumbColor={Colors.neutral.white}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version Pro</Text>
          <View style={styles.proCard}>
            <Text style={styles.proTitle}>
              {settings.isPro ? "✨ Version Pro active" : "Passer à la version Pro"}
            </Text>
            <Text style={styles.proDescription}>
              {settings.isPro
                ? "Vous avez accès à toutes les fonctionnalités premium"
                : "Export PDF, synchronisation Cloud et thèmes personnalisables"}
            </Text>
            {!settings.isPro && (
              <Pressable style={styles.proButton}>
                <Text style={styles.proButtonText}>2 € seulement</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.aboutText}>
            Babyrons v1.0.0{'\n'}
            Suivi des bébés pour parents de jumeaux et triplés{'\n'}
            © 2025 - MIT License
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          {session ? (
            <View style={styles.accountCard}>
              <Text style={styles.accountEmail}>{session.user.email}</Text>
              <Pressable style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutButtonText}>Se déconnecter</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.aboutText}>Non connecté</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
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
});