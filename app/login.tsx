import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../src/theme/spacing';
import { getSupabase } from '../src/utils/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      Alert.alert('Configuration manquante', 'Supabase n\'est pas configuré.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner email et mot de passe');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('Connexion échouée', error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  const handleRegister = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner email et mot de passe');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('Inscription échouée', error.message);
      return;
    }
    Alert.alert('Vérifiez votre email', 'Un lien de confirmation vous a été envoyé.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍼</Text>
        <Text style={styles.title}>Se connecter</Text>
        <Text style={styles.subtitle}>Entrez vos identifiants Supabase</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vous@exemple.com"
          placeholderTextColor={Colors.neutral.darkGray}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="••••••••"
          placeholderTextColor={Colors.neutral.darkGray}
        />

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.neutral.white} /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Créer un compte</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.lightGray },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { fontSize: 56, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.neutral.charcoal },
  subtitle: { marginTop: Spacing.xs, fontSize: FontSize.md, color: Colors.neutral.darkGray },
  form: { gap: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: '600', color: Colors.neutral.charcoal },
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.neutral.white, fontSize: FontSize.lg, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', marginTop: Spacing.md },
  secondaryButtonText: { color: Colors.pastel.mintActive, fontSize: FontSize.md, fontWeight: '700' },
});


