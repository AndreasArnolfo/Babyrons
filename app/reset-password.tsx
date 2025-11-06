import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../src/theme/spacing';
import { getSupabase } from '../src/utils/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Vérifier que nous avons les tokens nécessaires dans l'URL
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert('Erreur', 'Configuration Supabase manquante.');
      router.replace('/login');
      return;
    }

    // Vérifier si l'utilisateur a une session valide (nécessaire pour updateUser)
    // Supabase détecte automatiquement les tokens de réinitialisation dans l'URL (hash)
    const checkSession = async () => {
      try {
        // Attendre un peu pour que Supabase traite les tokens de l'URL
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la vérification de la session:', error);
          Alert.alert(
            'Erreur',
            'Une erreur est survenue lors de la vérification du lien.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/login'),
              },
            ]
          );
          return;
        }

        if (!session) {
          Alert.alert(
            'Lien invalide',
            'Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/login'),
              },
            ]
          );
          return;
        }

        // Vérifier que c'est bien une session de réinitialisation
        // Les sessions de réinitialisation ont généralement un type spécifique
        setIsValidating(false);
      } catch (error) {
        console.error('Erreur lors de la validation:', error);
        Alert.alert(
          'Erreur',
          'Une erreur est survenue. Veuillez réessayer.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert('Erreur', 'Configuration Supabase manquante.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      return;
    }

    Alert.alert(
      'Succès',
      'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  if (isValidating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.pastel.mintActive} />
        <Text style={styles.loadingText}>Vérification du lien...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={styles.title}>Réinitialiser le mot de passe</Text>
        <Text style={styles.subtitle}>Entrez votre nouveau mot de passe</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nouveau mot de passe</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Minimum 6 caractères"
          placeholderTextColor={Colors.neutral.darkGray}
        />

        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Répétez le mot de passe"
          placeholderTextColor={Colors.neutral.darkGray}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.neutral.white} />
          ) : (
            <Text style={styles.buttonText}>Réinitialiser le mot de passe</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/login')}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Retour à la connexion</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightGray,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral.darkGray,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.neutral.charcoal,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: FontSize.md,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.neutral.charcoal,
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral.charcoal,
    borderWidth: 1,
    borderColor: Colors.neutral.gray,
  },
  button: {
    backgroundColor: Colors.pastel.mintActive,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  secondaryButtonText: {
    color: Colors.pastel.mintActive,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});

