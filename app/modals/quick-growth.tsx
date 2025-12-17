import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';
import { ScalePressable } from '../../src/components/common/ScalePressable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../../src/utils/haptics';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function QuickGrowthModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { babies, addEvent } = useBabyStore();
    const theme = useAppTheme();

    const [step, setStep] = useState<'baby' | 'details'>('baby');
    const [selectedBabyId, setSelectedBabyId] = useState<string>((params.babyId as string) || '');

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [head, setHead] = useState('');

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
            type: 'growth',
            at: date.getTime(),
            weightKg: weight ? parseFloat(weight.replace(',', '.')) : undefined,
            heightCm: height ? parseFloat(height.replace(',', '.')) : undefined,
            headCircumferenceCm: head ? parseFloat(head.replace(',', '.')) : undefined,
        } as any);

        router.back();
    };

    const renderBabySelection = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Qui a grandi ? 📏</Text>
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

    const renderDetails = () => (
        <ScrollView contentContainerStyle={styles.stepContainer} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: theme.colors.text }]}>Mesures</Text>

            <View style={styles.inputGroup}>
                {/* Date Selection */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date</Text>
                    {Platform.OS === 'ios' ? (
                        <View style={{ alignItems: 'center', marginVertical: 8 }}>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setDate(selectedDate);
                                }}
                                maximumDate={new Date()}
                                themeVariant={theme.isDark ? 'dark' : 'light'}
                            />
                        </View>
                    ) : (
                        <>
                            <Pressable
                                style={[styles.input, { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border, justifyContent: 'center' }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={{ color: theme.colors.text, fontSize: FontSize.lg, textAlign: 'center' }}>
                                    {date.toLocaleDateString('fr-FR')}
                                </Text>
                            </Pressable>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setDate(selectedDate);
                                    }}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Poids (kg)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.cardBg, color: theme.colors.text, borderColor: theme.colors.border }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={weight}
                        onChangeText={setWeight}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Taille (cm)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.cardBg, color: theme.colors.text, borderColor: theme.colors.border }]}
                        placeholder="0.0"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={height}
                        onChangeText={setHeight}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Tête (cm)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.cardBg, color: theme.colors.text, borderColor: theme.colors.border }]}
                        placeholder="0.0"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={head}
                        onChangeText={setHead}
                    />
                </View>
            </View>

            <ScalePressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Valider</Text>
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
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 30,
        padding: 10,
        zIndex: 10,
        borderRadius: 20,
    },
    stepContainer: {
        alignItems: 'center',
        width: '100%',
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
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
        minWidth: 100,
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
    },
    inputGroup: {
        width: '100%',
        gap: Spacing.lg,
        marginBottom: Spacing.xxl,
    },
    inputContainer: {
        width: '100%',
    },
    label: {
        fontSize: FontSize.md,
        marginBottom: Spacing.xs,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: Spacing.md,
        fontSize: FontSize.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        textAlign: 'center',
    },
    saveButton: {
        width: '100%',
        backgroundColor: Colors.pastel.mintActive,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.neutral.white,
        fontSize: FontSize.xl,
        fontWeight: 'bold',
    },
});
