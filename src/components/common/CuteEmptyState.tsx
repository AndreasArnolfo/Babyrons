import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';

interface CuteEmptyStateProps {
    title: string;
    message: string;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    actionLabel?: string;
    onAction?: () => void;
}

export function CuteEmptyState({
    title,
    message,
    icon = "emoticon-happy-outline",
}: CuteEmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={icon} size={32} color={Colors.modern.accent} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        backgroundColor: Colors.modern.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
        borderWidth: 2,
        borderColor: '#F8F0FF', // Very soft lavender border
        borderStyle: 'dashed',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.modern.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    message: {
        fontSize: FontSize.sm,
        color: Colors.modern.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
