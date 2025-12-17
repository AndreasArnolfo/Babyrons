import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';
import { ScalePressable } from '../../src/components/common/ScalePressable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../../src/utils/haptics';
import { useAppTheme } from '../../src/hooks/useAppTheme';

export default function QuickSleepModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { babies, addEvent } = useBabyStore();
    const theme = useAppTheme();

    const [step, setStep] = useState<'baby' | 'details'>('baby');
    const [selectedBabyId, setSelectedBabyId] = useState<string>((params.babyId as string) || '');

    // Modes: 'now' (Start sleep now) or 'log' (Log past nap with duration)
    const [mode, setMode] = useState<'now' | 'log'>('now');
    const [durationMinutes, setDurationMinutes] = useState<number>(60);

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

        if (mode === 'now') {
            // Start sleep now
            addEvent({
                babyId: selectedBabyId,
                type: 'sleep',
                at: Date.now(),
                startAt: Date.now(),
            } as any);
        } else {
            // Log past nap
            const endAt = Date.now();
            const startAt = endAt - (durationMinutes * 60 * 1000);
            addEvent({
                babyId: selectedBabyId,
                type: 'sleep',
                at: startAt,
                startAt: startAt,
                endAt: endAt,
                duration: durationMinutes * 60 * 1000,
            } as any);
        }

        router.back();
    };

    const renderBabySelection = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Qui va au dodo ? 😴</Text>
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
        <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Au dodo !</Text>

            <View style={styles.modeSelector}>
                <ScalePressable
                    onPress={() => {
                        HapticFeedback.selection();
                        setMode('now');
                    }}
                    style={[
                        styles.modeCard,
                        mode === 'now' ? styles.modeCardActive : { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }
                    ]}
                >
                    <Text style={styles.modeEmoji}>🌙</Text>
                    <Text style={[styles.modeTitle, mode === 'now' ? styles.modeTitleActive : { color: theme.colors.text }]}>
                        S'endort maintenant
                    </Text>
                    <Text style={[styles.modeDesc, { color: theme.colors.textSecondary }]}>Lance le chrono</Text>
                </ScalePressable>

                <ScalePressable
                    onPress={() => {
                        HapticFeedback.selection();
                        setMode('log');
                    }}
                    style={[
                        styles.modeCard,
                        mode === 'log' ? styles.modeCardActive : { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }
                    ]}
                >
                    <Text style={styles.modeEmoji}>⏱️</Text>
                    <Text style={[styles.modeTitle, mode === 'log' ? styles.modeTitleActive : { color: theme.colors.text }]}>
                        Noter une sieste
                    </Text>
                    <Text style={[styles.modeDesc, { color: theme.colors.textSecondary }]}>Déjà terminée</Text>
                </ScalePressable>
            </View>

            {mode === 'log' && (
                <View style={styles.durationSection}>
                    <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Durée de la sieste :</Text>

                    <View style={styles.durationShortcuts}>
                        {[30, 45, 60, 90, 120, 150, 180].map(mins => (
                            <ScalePressable
                                key={mins}
                                onPress={() => {
                                    HapticFeedback.light();
                                    setDurationMinutes(mins);
                                }}
                                style={[
                                    styles.chip,
                                    durationMinutes === mins ? styles.chipActive : { backgroundColor: theme.isDark ? theme.colors.surface : Colors.neutral.lightGray }
                                ]}
                            >
                                <Text style={[
                                    styles.chipText,
                                    durationMinutes === mins ? styles.chipTextActive : { color: theme.colors.text }
                                ]}>
                                    {mins < 60 ? `${mins}m` : `${mins / 60}h${mins % 60 ? (mins % 60) : ''}`}
                                </Text>
                            </ScalePressable>
                        ))}
                    </View>
                </View>
            )}

            <ScalePressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>
                    {mode === 'now' ? 'Bonne nuit 💤' : 'Enregistrer'}
                </Text>
            </ScalePressable>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Pressable style={[styles.closeButton, { backgroundColor: theme.isDark ? theme.colors.surface : Colors.neutral.lightGray }]} onPress={() => router.back()}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
            </Pressable>

            {step === 'baby' ? renderBabySelection() : renderDetails()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.white,
        padding: Spacing.xl,
        justifyContent: 'center',
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
        alignItems: 'center',
        width: '100%',
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
        color: Colors.neutral.charcoal,
    },
    modeSelector: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
        width: '100%',
    },
    modeCard: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        borderColor: Colors.neutral.lightGray,
        backgroundColor: Colors.neutral.white,
    },
    modeCardActive: {
        borderColor: Colors.pastel.roseActive, // Using rose for sleep/calm vibe
        backgroundColor: Colors.pastel.rose + '20',
    },
    modeEmoji: {
        fontSize: 32,
        marginBottom: Spacing.sm,
    },
    modeTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: Colors.neutral.charcoal,
        textAlign: 'center',
    },
    modeTitleActive: {
        color: Colors.pastel.roseActive,
    },
    modeDesc: {
        fontSize: FontSize.sm,
        color: Colors.neutral.darkGray,
        textAlign: 'center',
    },
    durationSection: {
        width: '100%',
        marginBottom: Spacing.xxl,
    },
    sectionLabel: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.md,
    },
    durationShortcuts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.lightGray,
    },
    chipActive: {
        backgroundColor: Colors.pastel.roseActive,
    },
    chipText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.neutral.charcoal,
    },
    chipTextActive: {
        color: Colors.neutral.white,
    },
    saveButton: {
        width: '100%',
        backgroundColor: Colors.pastel.roseActive, // Changed to rose for Sleep
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
