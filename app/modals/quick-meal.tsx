import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';
import { ScalePressable } from '../../src/components/common/ScalePressable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../../src/utils/haptics';
import { useAppTheme } from '../../src/hooks/useAppTheme';

export default function QuickMealModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { babies, addEvent } = useBabyStore();
    const theme = useAppTheme();

    const [selectedBabyId, setSelectedBabyId] = useState<string>((params.babyId as string) || '');
    const [step, setStep] = useState<'baby' | 'details'>('baby');

    // Meal details
    const [foodType, setFoodType] = useState<'vegetable' | 'fruit' | 'protein' | 'starch' | 'dairy' | 'cereal'>('vegetable');
    const [note, setNote] = useState(''); // Name of food e.g. "Carrot"
    const [amount, setAmount] = useState<string>(''); // in grams (string input)

    useEffect(() => {
        if (params.babyId || babies.length === 1) {
            if (!selectedBabyId && babies.length === 1) {
                setSelectedBabyId(babies[0].id);
            }
            setStep('details');
        }
    }, [params.babyId, babies.length]);

    const handleBabySelect = (id: string) => {
        HapticFeedback.selection();
        setSelectedBabyId(id);
        setStep('details');
    };

    const handleSave = () => {
        if (!selectedBabyId) return;
        HapticFeedback.success();

        addEvent({
            babyId: selectedBabyId,
            type: 'meal',
            at: Date.now(),
            foodType,
            note: note.trim() || undefined,
            amount: amount ? parseInt(amount, 10) : undefined,
        } as any); // Cast because store might not fully infer union yet

        router.back();
    };

    const renderBabySelection = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Qui a mangé ? 😋</Text>
            <View style={styles.babiesGrid}>
                {babies.map((baby) => (
                    <ScalePressable
                        key={baby.id}
                        onPress={() => handleBabySelect(baby.id)}
                        style={[styles.babyOption, { borderColor: baby.color, backgroundColor: theme.colors.cardBg }]}
                    >
                        <View style={[styles.babyAvatar, { backgroundColor: baby.color + '20' }]}>
                            <Text style={styles.babyEmoji}>👶</Text>
                        </View>
                        <Text style={[styles.babyName, { color: theme.colors.text }]}>{baby.name}</Text>
                    </ScalePressable>
                ))}
            </View>
        </View>
    );

    const foodTypes = [
        { key: 'vegetable', label: 'Légumes', icon: 'carrot', color: '#48BB78' },
        { key: 'fruit', label: 'Fruits', icon: 'food-apple', color: '#F56565' },
        { key: 'protein', label: 'Protéines', icon: 'food-drumstick', color: '#ED8936' },
        { key: 'starch', label: 'Féculents', icon: 'barley', color: '#ECC94B' }, // bread icon alternative
        { key: 'dairy', label: 'Laitage', icon: 'cheese', color: '#4299E1' },
        { key: 'cereal', label: 'Céréales', icon: 'corn', color: '#D69E2E' },
    ] as const;

    const renderDetails = () => (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Qu'est-ce qu'on mange ?</Text>

            {/* Food Type Grid */}
            <View style={styles.grid}>
                {foodTypes.map((type) => (
                    <ScalePressable
                        key={type.key}
                        onPress={() => {
                            HapticFeedback.selection();
                            setFoodType(type.key);
                        }}
                        style={[
                            styles.typeCard,
                            foodType === type.key
                                ? { borderColor: type.color, backgroundColor: type.color + '15' }
                                : { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={type.icon as any}
                            size={32}
                            color={foodType === type.key ? type.color : Colors.neutral.darkGray}
                        />
                        <Text style={[
                            styles.typeLabel,
                            foodType === type.key ? { color: type.color, fontWeight: '700' } : { color: theme.colors.textSecondary }
                        ]}>
                            {type.label}
                        </Text>
                    </ScalePressable>
                ))}
            </View>

            {/* Details Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.colors.text }]}>C'était quoi ? (optionnel)</Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: theme.isDark ? theme.colors.surface : Colors.neutral.lightGray,
                        color: theme.colors.text
                    }]}
                    placeholder="Ex: Purée de carottes, Compote..."
                    value={note}
                    onChangeText={setNote}
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Quantité (g)</Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: theme.isDark ? theme.colors.surface : Colors.neutral.lightGray,
                        color: theme.colors.text
                    }]}
                    placeholder="Ex: 130"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <ScalePressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Miam ! 🍽️</Text>
            </ScalePressable>
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <Pressable style={[styles.closeButton, { backgroundColor: theme.isDark ? theme.colors.surface : Colors.neutral.lightGray }]} onPress={() => router.back()}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
            </Pressable>

            {step === 'baby' ? renderBabySelection() : renderDetails()}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.white,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingTop: 80,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 30,
        padding: 10,
        zIndex: 10,
        backgroundColor: Colors.neutral.lightGray,
        borderRadius: 20,
    },
    stepContainer: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.xl,
        textAlign: 'center',
    },
    babiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    babyOption: {
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    babyAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    babyEmoji: {
        fontSize: 40,
    },
    babyName: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.neutral.charcoal,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'center',
        width: '100%',
        marginBottom: Spacing.xl,
    },
    typeCard: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: Colors.neutral.lightGray,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeLabel: {
        marginTop: Spacing.sm,
        fontSize: FontSize.sm,
        color: Colors.neutral.darkGray,
        fontWeight: '500',
    },
    inputSection: {
        width: '100%',
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.neutral.lightGray,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        fontSize: FontSize.md,
        color: Colors.neutral.charcoal,
    },
    saveButton: {
        width: '100%',
        backgroundColor: Colors.pastel.mintActive,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    saveButtonText: {
        color: Colors.neutral.white,
        fontSize: FontSize.xl,
        fontWeight: 'bold',
    },
});
