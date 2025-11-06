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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useBabyStore } from "../../src/state/useBabyStore";
import { useSupabaseAuth } from "../../src/hooks/useSupabaseAuth";
import { Colors } from "../../src/theme/colors";
import { Spacing, BorderRadius, FontSize } from "../../src/theme/spacing";
import { uploadBabyPhoto } from "../../src/lib/photoUpload";

export default function ManageBabyModal() {
  const router = useRouter();

  interface Baby {
    id: string;
    name: string;
    gender: "male" | "female" | null;
    birthDate: number | null;
    photo: string | null;
    color?: string;
  }

  const { babies, addBaby, removeBaby, updateBaby } = useBabyStore() as {
    babies: Baby[];
    addBaby: (baby: Omit<Baby, "id">) => void;
    removeBaby: (id: string) => void;
    updateBaby: (id: string, updates: Partial<Baby>) => void;
  };
  const { session } = useSupabaseAuth();

  const [newBabyName, setNewBabyName] = useState("");
  const [selectedSex, setSelectedSex] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoLocalUri, setPhotoLocalUri] = useState<string | null>(null); // URI locale avant upload
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingBabyId, setEditingBabyId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const defaultImageM = require("../../assets/images/baby_placeholder_m.png");
  const defaultImageF = require("../../assets/images/baby_placeholder_f.png");

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
      setPhotoLocalUri(result.assets[0].uri);
      // Afficher la photo localement pendant l'upload
      setPhoto(result.assets[0].uri);
    }
  };

  // ➕ Ajout ou modification
  const handleAddOrEditBaby = async () => {
    if (!newBabyName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un prénom.");
      return;
    }

    if (!session?.user?.id) {
      Alert.alert("Erreur", "Vous devez être connecté pour ajouter un bébé.");
      return;
    }

    const { babies } = useBabyStore.getState(); 
    const MAX_BABIES = 10; 

    if (!editingBabyId && babies.length >= MAX_BABIES) {
      Alert.alert(
        "Limite atteinte",
        `Vous avez atteint le nombre maximum de ${MAX_BABIES} bébés autorisés.`
      );
      return;
    }
    setIsUploading(true);

    try {
      let photoUrl: string | null = photo;

      // Si une nouvelle photo locale a été sélectionnée, l'uploader
      if (photoLocalUri && photoLocalUri.startsWith('file://')) {
        const babyId = editingBabyId || `baby-${Date.now()}`;
        const uploadedUrl = await uploadBabyPhoto(
          photoLocalUri,
          session.user.id,
          babyId
        );

        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        } else {
          Alert.alert("Attention", "La photo n'a pas pu être uploadée, mais le bébé sera créé sans photo.");
        }
      }

      if (editingBabyId) {
        // 🔄 Mode édition
        // Récupérer l'ancienne photo pour la supprimer si nécessaire
        const oldBaby = babies.find(b => b.id === editingBabyId);
        const oldPhotoUrl = oldBaby?.photo;

        updateBaby(editingBabyId, {
          name: newBabyName.trim(),
          gender: selectedSex,
          birthDate: birthDate ? birthDate.getTime() : null,
          photo: photoUrl,
        });

        // Supprimer l'ancienne photo si elle existe et est différente de la nouvelle
        if (oldPhotoUrl && oldPhotoUrl !== photoUrl && oldPhotoUrl.startsWith('http')) {
          const { deleteBabyPhoto } = require('../../src/lib/photoUpload');
          await deleteBabyPhoto(oldPhotoUrl);
        }

        Alert.alert("Succès", "Bébé modifié avec succès !");
        setEditingBabyId(null);
      } else {
        addBaby({
          name: newBabyName.trim(),
          gender: selectedSex,
          birthDate: birthDate ? birthDate.getTime() : null,
          photo: photoUrl,
        });
        Alert.alert("Succès", "Bébé ajouté avec succès !");
      }

      // Réinitialise les champs
      setNewBabyName("");
      setSelectedSex(null);
      setBirthDate(null);
      setPhoto(null);
      setPhotoLocalUri(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsUploading(false);
    }
  };

  // ✏️ Mode édition
  const handleEditBaby = (baby: Baby) => {
    setEditingBabyId(baby.id);
    setNewBabyName(baby.name);
    setSelectedSex(baby.gender);
    setBirthDate(baby.birthDate ? new Date(baby.birthDate) : null);
    setPhoto(baby.photo || null);
    setPhotoLocalUri(null); // Réinitialiser l'URI locale
    Alert.alert("Mode édition", `Vous modifiez ${baby.name}`);
  };

  // ❌ Suppression
  const handleRemoveBaby = (id: string, name: string) => {
    Alert.alert("Supprimer le bébé", `Supprimer ${name} et ses événements ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => removeBaby(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gérer les bébés</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      </View>

      {/* Formulaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {editingBabyId ? "Modifier un bébé" : "Ajouter un bébé"}
        </Text>

        {/* Photo */}
        <Pressable style={styles.imageContainer} onPress={pickImage}>
          <Image
            source={
              photo
                ? { uri: photo }
                : selectedSex === "female"
                ? defaultImageF
                : selectedSex === "male"
                ? defaultImageM
                : require("../../assets/images/baby-placeholder.png") // neutre
            }
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

        {/* Date */}
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

        {/* Bouton principal */}
        <Pressable 
          onPress={handleAddOrEditBaby} 
          style={[styles.addButton, isUploading && styles.addButtonDisabled]}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={Colors.neutral.white} />
          ) : (
            <Text style={styles.addButtonText}>
              {editingBabyId ? "Modifier ✏️" : "Ajouter 👶"}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Liste */}
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
                source={
                  baby.photo
                    ? { uri: baby.photo }
                    : baby.gender === "female"
                    ? defaultImageF
                    : baby.gender === "male"
                    ? defaultImageM
                    : require("../../assets/images/baby-placeholder.png")
                }
                key={`${baby.gender}-${baby.photo}`} // ✅ force le rafraîchissement quand le sexe change
                style={styles.image}
              />
              <View style={styles.babyInfo}>
                <Text style={styles.babyName}>{baby.name}</Text>
                {baby.birthDate && (
                  <Text style={styles.babyDate}>
                    🎂 {new Date(baby.birthDate).toLocaleDateString("fr-FR")}
                  </Text>
                )}
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => handleEditBaby(baby)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Modifier ✏️</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleRemoveBaby(baby.id, baby.name)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </Pressable>
              </View>
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
    marginTop: 30,
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
    marginRight: Spacing.md,
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
  addButtonDisabled: {
    opacity: 0.6,
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#A3D9A5",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  editButtonText: {
    color: "#2C3E50",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#F5B7B1",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.neutral.darkGray,
    fontSize: FontSize.md,
    textAlign: "center",
  },
});
