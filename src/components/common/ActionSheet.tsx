import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';

export interface Action {
    id: string;
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress: () => void;
    destructive?: boolean;
}

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    actions: Action[];
    title?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ActionSheet({ visible, onClose, actions, title }: ActionSheetProps) {
    const translateY = useSharedValue(SCREEN_HEIGHT);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, {
                damping: 15,
                stiffness: 100,
                mass: 0.8,
            });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        }
    }, [visible]);

    const handleClose = () => {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
            runOnJS(onClose)();
        });
    };

    const handleActionPress = (action: Action) => {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
            runOnJS(onClose)();
            runOnJS(action.onPress)();
        });
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            onRequestClose={handleClose}
            animationType="none" // Custom animation
        >
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.overlay}
            >
                <Pressable style={styles.overlayPressable} onPress={handleClose}>
                    <Animated.View
                        style={[styles.content, animatedStyle]}
                        onStartShouldSetResponder={() => true}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {title && <Text style={styles.title}>{title}</Text>}

                        <View style={styles.actionsContainer}>
                            {actions.map((action, index) => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[
                                        styles.actionButton,
                                        index < actions.length - 1 && styles.borderBottom
                                    ]}
                                    onPress={() => handleActionPress(action)}
                                >
                                    <MaterialCommunityIcons
                                        name={action.icon}
                                        size={24}
                                        color={action.destructive ? '#FC8181' : Colors.modern.text}
                                        style={styles.actionIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.actionLabel,
                                            action.destructive && styles.destructiveLabel
                                        ]}
                                    >
                                        {action.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelLabel}>Annuler</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    overlayPressable: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: Colors.modern.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl + 20, // Extra padding for bottom safe area
        ...Colors.shadows.glow,
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.modern.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    actionsContainer: {
        backgroundColor: Colors.modern.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.modern.surface,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    actionIcon: {
        marginRight: Spacing.md,
    },
    actionLabel: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: Colors.modern.text,
    },
    destructiveLabel: {
        color: '#FC8181', // Soft Red
    },
    cancelButton: {
        backgroundColor: Colors.modern.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    cancelLabel: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.modern.text,
    },
});
