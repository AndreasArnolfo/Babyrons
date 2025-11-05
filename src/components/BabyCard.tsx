import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Baby } from "../data/types";
import { Colors } from "../theme/colors";
import { Spacing, BorderRadius, FontSize } from "../theme/spacing";

interface BabyCardProps {
  baby: Baby;
  onPress?: () => void;
  isSelected?: boolean;
}

export function BabyCard({ baby, onPress, isSelected = false }: BabyCardProps) {
  const defaultImage = require("../../assets/images/baby-placeholder.png");
  const defaultImageM = require("../../assets/images/baby_placeholder_m.png");
  const defaultImageF = require("../../assets/images/baby_placeholder_f.png");

  // 🧩 Sécurisation de la donnée (si baby.name est un objet, on récupère le vrai nom)
  const babyName =
    typeof baby.name === "string"
      ? baby.name
      : (typeof baby.name === "object" && baby.name !== null && "name" in baby.name
        ? String((baby.name as { name: string }).name)
        : "Bébé");

  const imageSource = baby.photo
    ? { uri: baby.photo }
    : baby.gender === "female"
    ? defaultImageF
    : baby.gender === "male"
    ? defaultImageM
    : defaultImage;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: baby.color || Colors.pastel.rose },
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
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
    marginRight: Spacing.md,
    marginVertical: Spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  selected: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
