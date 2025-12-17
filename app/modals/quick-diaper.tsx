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

export default function QuickDiaperModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { babies, addEvent } = useBabyStore();
    const theme = useAppTheme();

    const [step, setStep] = useState<'baby' | 'details'>('baby');
    const [selectedBabyId, setSelectedBabyId] = useState<string>((params.babyId as string) || '');
    const [kind, setKind] = useState<'wet' | 'dirty' | 'both'>('wet');

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
            type: 'diaper',
            at: Date.now(),
            kind: kind,
        } as any);

        router.back();
    };

    const renderBabySelection = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Qui a besoin d'être changé ? 👶</Text>
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Quoi de neuf ?</Text>

            <View style={styles.kindSelectorVertical}>
                {(['wet', 'dirty', 'both'] as const).map(k => (
                    <ScalePressable
                        key={k}
                        onPress={() => {
                            HapticFeedback.selection();
                            setKind(k);
                        }}
                        style={[
                            styles.kindCard,
                            kind === k ? styles.kindCardActive : { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }
                        ]}
                    >
                        <Text style={styles.kindEmoji}>
                            {k === 'wet' ? '💧' : k === 'dirty' ? '💩' : '🔄'}
                        </Text>
                        <Text style={[
                            styles.kindCardText,
                            kind === k ? styles.kindCardTextActive : { color: theme.colors.text }
                        ]}>
                            {k === 'wet' ? 'Pipi' : k === 'dirty' ? 'Caca' : 'Les deux'}
                        </Text>
                        {/* Indicateur visuel pour choix actif */}
                        {kind === k && (
                            <View style={styles.checkIcon}>
                                <MaterialCommunityIcons name="check-circle" size={24} color={Colors.pastel.mintActive} />
                            </View>
                        )}
                    </ScalePressable>
                ))}
            </View>

            <ScalePressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Valider</Text>
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
    kindSelectorVertical: {
        width: '100%',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    kindCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        borderColor: Colors.neutral.lightGray,
        backgroundColor: Colors.neutral.white,
    },
    kindCardActive: {
        borderColor: Colors.pastel.mintActive,
        backgroundColor: Colors.pastel.mint + '20',
    },
    kindEmoji: {
        fontSize: 32,
        marginRight: Spacing.lg,
    },
    kindCardText: {
        fontSize: FontSize.xl,
        fontWeight: '600',
        color: Colors.neutral.charcoal,
        flex: 1,
    },
    kindCardTextActive: {
        color: Colors.pastel.mintActive,
        fontWeight: '700',
    },
    checkIcon: {
        marginLeft: 'auto',
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
