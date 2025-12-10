import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBabyStore } from '../../src/state/useBabyStore';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../src/theme/spacing';
import { ScalePressable } from '../../src/components/common/ScalePressable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticFeedback } from '../../src/utils/haptics';

export default function QuickBottleModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { babies, events, addEvent } = useBabyStore();

    const [step, setStep] = useState<'baby' | 'details'>('baby');
    const [selectedBabyId, setSelectedBabyId] = useState<string>((params.babyId as string) || '');

    // Bottle details
    const [amount, setAmount] = useState<number>(120);
    const [kind, setKind] = useState<'formula' | 'breastmilk' | 'mixed'>('formula');

    // Load last bottle details when a baby is selected
    useEffect(() => {
        if (!selectedBabyId) return;

        const babyEvents = events.filter(e => e.babyId === selectedBabyId && e.type === 'bottle');
        // Sort by most recent
        const lastBottle = babyEvents.sort((a, b) => b.at - a.at)[0] as any;

        if (lastBottle) {
            if (lastBottle.ml) setAmount(lastBottle.ml);
            if (lastBottle.kind) setKind(lastBottle.kind);
        }
    }, [selectedBabyId, events]);

    useEffect(() => {
        // If we have a babyId passed in, or only one baby exists, skip selection
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

    const adjustAmount = (delta: number) => {
        HapticFeedback.light();
        setAmount(prev => Math.max(0, prev + delta));
    };

    const handleSave = () => {
        if (!selectedBabyId || amount <= 0) return;
        HapticFeedback.success();

        addEvent({
            babyId: selectedBabyId,
            type: 'bottle',
            at: Date.now(),
            ml: amount,
            kind: kind,
        });

        router.back();
    };

    const renderBabySelection = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Qui a faim ? 🍼</Text>
            <View style={styles.babiesGrid}>
                {babies.map((baby) => (
                    <ScalePressable
                        key={baby.id}
                        onPress={() => handleBabySelect(baby.id)}
                        style={[styles.babyOption, { borderColor: baby.color }]}
                    >
                        <View style={[styles.babyAvatar, { backgroundColor: baby.color + '20' }]}>
                            <Text style={styles.babyEmoji}>👶</Text>
                        </View>
                        <Text style={styles.babyName}>{baby.name}</Text>
                    </ScalePressable>
                ))}
            </View>
        </View>
    );

    const renderDetails = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Quantité ?</Text>

            <View style={styles.amountContainer}>
                <ScalePressable onPress={() => adjustAmount(-10)} style={styles.adjustButton}>
                    <MaterialCommunityIcons name="minus" size={32} color={Colors.neutral.charcoal} />
                </ScalePressable>

                <View style={styles.amountDisplay}>
                    <Text style={styles.amountText}>{amount}</Text>
                    <Text style={styles.unitText}>ml</Text>
                </View>

                <ScalePressable onPress={() => adjustAmount(10)} style={styles.adjustButton}>
                    <MaterialCommunityIcons name="plus" size={32} color={Colors.neutral.charcoal} />
                </ScalePressable>
            </View>

            <View style={styles.shortcuts}>
                {[60, 90, 120, 150, 180, 210].map(val => (
                    <ScalePressable
                        key={val}
                        onPress={() => {
                            HapticFeedback.selection();
                            setAmount(val);
                        }}
                        style={[styles.shortcutChip, amount === val && styles.shortcutChipActive]}
                    >
                        <Text style={[styles.shortcutText, amount === val && styles.shortcutTextActive]}>{val}</Text>
                    </ScalePressable>
                ))}
            </View>

            <View style={styles.kindSelector}>
                {(['formula', 'breastmilk', 'mixed'] as const).map(k => (
                    <ScalePressable
                        key={k}
                        onPress={() => {
                            HapticFeedback.selection();
                            setKind(k);
                        }}
                        style={[styles.kindOption, kind === k && styles.kindOptionActive]}
                    >
                        <Text style={[styles.kindText, kind === k && styles.kindTextActive]}>
                            {k === 'formula' ? '🥣 Poudre' : k === 'breastmilk' ? '🤱 Maternel' : '🔄 Mixte'}
                        </Text>
                    </ScalePressable>
                ))}
            </View>

            <ScalePressable onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Valider</Text>
            </ScalePressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <Pressable style={styles.closeButton} onPress={() => router.back()}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.neutral.darkGray} />
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
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        gap: Spacing.lg,
    },
    adjustButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.neutral.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    amountDisplay: {
        alignItems: 'center',
        minWidth: 120,
    },
    amountText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: Colors.pastel.sky,
    },
    unitText: {
        fontSize: FontSize.xl,
        color: Colors.neutral.darkGray,
        marginTop: -10,
    },
    shortcuts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    shortcutChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.lightGray,
    },
    shortcutChipActive: {
        backgroundColor: Colors.pastel.sky,
    },
    shortcutText: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.neutral.charcoal,
    },
    shortcutTextActive: {
        color: Colors.neutral.white,
    },
    kindSelector: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    kindOption: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.neutral.gray,
        backgroundColor: Colors.neutral.white,
    },
    kindOptionActive: {
        borderColor: Colors.pastel.sky,
        backgroundColor: Colors.pastel.sky + '20',
    },
    kindText: {
        fontSize: FontSize.md,
        fontWeight: '500',
        color: Colors.neutral.darkGray,
    },
    kindTextActive: {
        color: Colors.pastel.skyActive,
        fontWeight: '700',
    },
    saveButton: {
        width: '100%',
        backgroundColor: Colors.pastel.skyActive,
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
