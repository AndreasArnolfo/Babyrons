import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useBabyStore } from "../../src/state/useBabyStore";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";

export default function ManageBabyModal() {
  const router = useRouter();
  interface Baby {
    id: string;
    name: string | { name: string };
    birthDate: number | null;
    photo: string | null;
    color?: string;
    gender: "male" | "female" | null;
  }
  const { babies, addBaby, removeBaby } = useBabyStore() as {
    babies: Baby[];
    addBaby: (baby: Omit<Baby, "id">) => void;
    removeBaby: (id: string) => void;
  };

  const [newBabyName, setNewBabyName] = useState("");
  const [selectedSex, setSelectedSex] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const defaultImage = require("../../assets/images/baby-placeholder.png");

  // 🍼 Choix photo
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Autorisez l'accès à la galerie pour choisir une photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ➕ Ajout bébé
  const handleAddBaby = () => {
    if (!newBabyName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un prénom.");
      return;
    }

    addBaby({
      name: newBabyName.trim(),
      gender: selectedSex,
      birthDate: birthDate ? birthDate.getTime() : null,
      photo,
    });

    setNewBabyName("");
    setSelectedSex(null);
    setBirthDate(null);
    setPhoto(null);
  };

  const handleRemoveBaby = (id: string, displayName: string) => {
    Alert.alert(
      "Supprimer le bébé",
      `Supprimer ${displayName} et ses événements ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => removeBaby(id) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gérer les bébés</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      </View>

      {/* Ajouter bébé */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajouter un bébé</Text>

        {/* Photo */}
        <Pressable style={styles.imageContainer} onPress={pickImage}>
          <Image
            source={photo ? { uri: photo } : defaultImage}
            style={styles.image}
          />
          <Text style={styles.imageText}>
            {photo ? "Changer la photo" : "Ajouter une photo"}
          </Text>
        </Pressable>

        {/* Nom */}
        <TextInput
          style={styles.input}
          value={newBabyName}
          onChangeText={setNewBabyName}
          placeholder="Prénom du bébé"
          placeholderTextColor={Colors.neutral.darkGray}
        />

        {/* Sexe */}
        <View style={styles.genderRow}>
          <Pressable
            style={[
              styles.genderButton,
              selectedSex === "male" && styles.genderSelectedMale,
            ]}
            onPress={() => setSelectedSex("male")}
          >
            <Text
              style={[
                styles.genderText,
                selectedSex === "male" && styles.genderTextSelected,
              ]}
            >
              👦 Garçon
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.genderButton,
              selectedSex === "female" && styles.genderSelectedFemale,
            ]}
            onPress={() => setSelectedSex("female")}
          >
            <Text
              style={[
                styles.genderText,
                selectedSex === "female" && styles.genderTextSelected,
              ]}
            >
              👧 Fille
            </Text>
          </Pressable>
        </View>

        {/* Date de naissance */}
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {birthDate
              ? `Né(e) le ${birthDate.toLocaleDateString("fr-FR")}`
              : "📅 Sélectionner une date de naissance"}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={birthDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setBirthDate(selectedDate);
            }}
          />
        )}

        {/* Bouton enregistrer */}
        <Pressable onPress={handleAddBaby} style={styles.addButton}>
          <Text style={styles.addButtonText}>Ajouter 👶</Text>
        </Pressable>
      </View>

      {/* Liste des bébés */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bébés existants</Text>
        {babies.length === 0 ? (
          <Text style={styles.emptyText}>Aucun bébé ajouté.</Text>
        ) : (
          babies.map((baby) => (
            <View
              key={baby.id}
              style={[styles.babyCard, { borderLeftColor: baby.color || "#9CBEB3" }]}
            >
              <Image
                source={baby.photo ? { uri: baby.photo } : defaultImage}
                style={styles.listImage}
              />
              <View style={styles.babyInfo}>
                <Text style={styles.babyName}>
                  {typeof baby.name === "string" ? baby.name : baby.name?.name || "Bébé"}
                </Text>
                {baby.birthDate && (
                  <Text style={styles.babyDate}>
                    🎂 {new Date(baby.birthDate).toLocaleDateString("fr-FR")}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() =>
                  handleRemoveBaby(
                    baby.id,
                    typeof baby.name === "string" ? baby.name : baby.name?.name || "Bébé"
                  )
                }
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.neutral.charcoal,
  },
  closeButton: {
    fontSize: FontSize.xl,
    color: Colors.neutral.darkGray,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageText: {
    color: Colors.neutral.darkGray,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    marginBottom: Spacing.md,
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginHorizontal: 4,
  },
  genderSelectedMale: {
    backgroundColor: "#9CC6E7",
  },
  genderSelectedFemale: {
    backgroundColor: "#E8B7D4",
  },
  genderText: {
    color: Colors.neutral.charcoal,
  },
  genderTextSelected: {
    color: Colors.neutral.white,
    fontWeight: "600",
  },
  dateButton: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dateButtonText: {
    color: Colors.neutral.charcoal,
    fontSize: FontSize.md,
  },
  addButton: {
    backgroundColor: Colors.pastel.mintActive,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: FontSize.lg,
    color: Colors.neutral.white,
    fontWeight: "bold",
  },
  babyCard: {
    flexDirection: "row",
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.neutral.charcoal,
    marginBottom: 4,
  },
  babyDate: {
    fontSize: FontSize.sm,
    color: Colors.neutral.darkGray,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: FontSize.lg,
  },
  emptyText: {
    color: Colors.neutral.darkGray,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
