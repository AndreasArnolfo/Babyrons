import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Baby } from "../data/types";
import { Colors } from "../theme/colors";
import { Spacing, BorderRadius, FontSize } from "../theme/spacing";

interface BabyCardProps {
  baby: Baby;
  onPress?: () => void;
}

export function BabyCard({ baby, onPress }: BabyCardProps) {
  const defaultImage = require("../../assets/images/baby-placeholder.png");

  // 🧩 Sécurisation de la donnée (si baby.name est un objet, on récupère le vrai nom)
  const babyName =
    typeof baby.name === "string"
      ? baby.name
      : (typeof baby.name === "object" && baby.name !== null && "name" in baby.name
        ? String((baby.name as { name: string }).name)
        : "Bébé");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: baby.color || Colors.pastel.rose },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={baby.photo ? { uri: baby.photo } : defaultImage}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.name}>{babyName}</Text>
    </Pressable>
  );
}

const CARD_SIZE = 120;

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE + 24,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: Spacing.xs,
    margin: Spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  imageContainer: {
    width: CARD_SIZE - Spacing.md,
    height: CARD_SIZE - Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.neutral.charcoal,
    textAlign: "center",
  },
});
