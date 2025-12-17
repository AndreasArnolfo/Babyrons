import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { HapticFeedback } from '../utils/haptics';
import { BlurView } from 'expo-blur';
import { useBabyStore } from '../state/useBabyStore';
import { ServiceType } from '../data/types';

const FAB_SIZE = 64;
const OPTION_SIZE = 50;
const RADIUS = 100; // Distance of options from center

interface QuickAddFabProps {
    onPressOption: (type: 'bottle' | 'sleep' | 'diaper' | 'meal' | 'growth' | 'med') => void;
}

const ALL_OPTIONS: { type: ServiceType; icon: string; color: string }[] = [
    { type: 'bottle', icon: 'baby-bottle', color: '#4299E1' },
    { type: 'meal', icon: 'food-apple', color: '#48BB78' },
    { type: 'sleep', icon: 'sleep', color: '#9F7AEA' },
    { type: 'diaper', icon: 'emoticon-poop', color: '#ED8936' },
    { type: 'growth', icon: 'ruler', color: '#ECC94B' },
    { type: 'med', icon: 'pill', color: '#F56565' },
];

interface OptionItemProps {
    icon: string;
    color: string;
    type: any;
    angle: number;
    animation: Animated.SharedValue<number>;
    isOpen: boolean;
    onPress: (type: any) => void;
}

const OptionItem = ({ icon, color, type, angle, animation, isOpen, onPress }: OptionItemProps) => {
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
            <TouchableWithoutFeedback onPress={() => onPress(type)}>
                <View style={[styles.optionButton, { backgroundColor: color }]}>
                    <MaterialCommunityIcons name={icon as any} size={24} color="#FFF" />
                </View>
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};

export function QuickAddFab({ onPressOption }: QuickAddFabProps) {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useSharedValue(0);
    const { settings } = useBabyStore();

    const activeOptions = useMemo(() => {
        return ALL_OPTIONS.filter(opt => settings.enabledServices.includes(opt.type));
    }, [settings.enabledServices]);

    const toggleMenu = () => {
        HapticFeedback.medium();
        const nextState = !isOpen;
        setIsOpen(nextState);

        animation.value = withSpring(nextState ? 1 : 0, {
            damping: 15,
            stiffness: 120,
        });
    };

    const handleOptionPress = (type: any) => {
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
                {activeOptions.map((opt, index) => {
                    // Spread from -165 to -15 (150 degrees span)
                    // If 1 item: -90
                    // If >1: start -165, step 150/(count-1)

                    let angle = -90;
                    if (activeOptions.length > 1) {
                        const step = 150 / (activeOptions.length - 1);
                        angle = -165 + (index * step);
                    }

                    return (
                        <OptionItem
                            key={opt.type}
                            icon={opt.icon}
                            color={opt.color}
                            type={opt.type}
                            angle={angle}
                            animation={animation}
                            isOpen={isOpen}
                            onPress={handleOptionPress}
                        />
                    );
                })}
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
        backgroundColor: 'rgba(0,0,0,0.2)',
        top: -1000,
        bottom: -1000,
        left: -1000,
        right: -1000,
    }
});
