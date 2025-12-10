import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate,
    runOnJS
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { HapticFeedback } from '../utils/haptics';
import { BlurView } from 'expo-blur';

const FAB_SIZE = 64;
const OPTION_SIZE = 50;
const RADIUS = 100; // Distance of options from center

interface QuickAddFabProps {
    onPressOption: (type: 'bottle' | 'sleep' | 'diaper') => void;
}

export function QuickAddFab({ onPressOption }: QuickAddFabProps) {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useSharedValue(0);

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;

        HapticFeedback.medium();

        if (toValue === 1) {
            setIsOpen(true);
        }

        animation.value = withSpring(toValue, {
            damping: 15,
            stiffness: 120,
        }, (finished) => {
            if (finished && toValue === 0) {
                runOnJS(setIsOpen)(false);
            }
        });
    };

    const handleOptionPress = (type: 'bottle' | 'sleep' | 'diaper') => {
        HapticFeedback.selection();
        onPressOption(type);
        toggleMenu();
    };

    // Rotation style for the main plus button
    const plusStyle = useAnimatedStyle(() => {
        const rotate = interpolate(animation.value, [0, 1], [0, 45], Extrapolate.CLAMP);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    // Background blur opacity
    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: animation.value,
            pointerEvents: isOpen ? 'auto' : 'none',
        };
    });

    const renderOption = (icon: string, color: string, type: 'bottle' | 'sleep' | 'diaper', angle: number, delay: number) => {
        // Calculate position based on angle
        // 0 degrees is right, -90 is up, 180 is left.
        // We want them effectively at -135 (left-up), -90 (up), -45 (right-up) if placed bottom right.
        // Assuming FAB is bottom-center for now, or bottom-right? 
        // Let's place FAB bottom-center. Then angles: -180 (left), -90 (up), 0 (right).
        // Or better: -150, -90, -30 for a nice arc.

        const radian = (angle * Math.PI) / 180;
        const x = RADIUS * Math.cos(radian);
        const y = RADIUS * Math.sin(radian);

        const optionStyle = useAnimatedStyle(() => {
            const scale = interpolate(animation.value, [0, 1], [0, 1], Extrapolate.CLAMP);
            const translateX = interpolate(animation.value, [0, 1], [0, x], Extrapolate.CLAMP);
            const translateY = interpolate(animation.value, [0, 1], [0, y], Extrapolate.CLAMP);

            return {
                transform: [
                    { translateX },
                    { translateY },
                    { scale },
                ],
                opacity: animation.value,
            };
        });

        return (
            <Animated.View style={[styles.optionContainer, optionStyle, { pointerEvents: isOpen ? 'auto' : 'none' }]}>
                <TouchableWithoutFeedback onPress={() => handleOptionPress(type)}>
                    <View style={[styles.optionButton, { backgroundColor: color }]}>
                        <MaterialCommunityIcons name={icon as any} size={24} color="#FFF" />
                    </View>
                </TouchableWithoutFeedback>
                {/* Optional Label */}
                {/* <Text style={styles.label}>{type}</Text> */}
            </Animated.View>
        );
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Backdrop for closing */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
                </TouchableWithoutFeedback>
            </Animated.View>

            {/* Options Arc (Centered above button) */}
            <View style={styles.optionsWrapper} pointerEvents="box-none">
                {renderOption('baby-bottle', '#4299E1', 'bottle', -140, 0)}
                {renderOption('sleep', '#9F7AEA', 'sleep', -90, 0)}
                {renderOption('emoticon-poop', '#ED8936', 'diaper', -40, 0)}
            </View>

            {/* Main FAB */}
            <TouchableWithoutFeedback onPress={toggleMenu}>
                <Animated.View style={[styles.fab, styles.shadow]}>
                    <Animated.View style={plusStyle}>
                        <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
                    </Animated.View>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center', // Center perfectly horizontally
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: Colors.pastel.mintActive,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shadow: {
        shadowColor: Colors.pastel.mintActive,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    optionsWrapper: {
        position: 'absolute',
        bottom: FAB_SIZE / 2, // Start from center of FAB
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    optionContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionButton: {
        width: OPTION_SIZE,
        height: OPTION_SIZE,
        borderRadius: OPTION_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    backdrop: {
        // We will need to layout this backdrop to cover the whole screen
        // This is tricky inside a localized component. 
        // For now, we'll just rely on the area around the button or use a portal if needed.
        // Actually, StyleSheet.absoluteFill only fills the parent. 
        // If container is absolute bottom, fill will be weird.
        // Solution: Make the container fill the whole screen only when open?
        // Or position manually. Simpler: Just rely on click-away on the options area for now.
        // Or better: Let's remove the backdrop logic from here and just have clear interaction.
        // Re-adding backdrop logic properly later if needed. 
        backgroundColor: 'rgba(0,0,0,0.2)',
        top: -1000, // Hack to cover screen upwards
        bottom: -1000,
        left: -1000,
        right: -1000,
    }
});
