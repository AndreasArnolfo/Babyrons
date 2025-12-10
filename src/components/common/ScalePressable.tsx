import React, { useRef } from 'react';
import { Pressable, Animated, ViewStyle, StyleProp } from 'react-native';

interface ScalePressableProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
    disabled?: boolean;
}

import { HapticFeedback } from '../../utils/haptics';

export function ScalePressable({
    children,
    onPress,
    style,
    scaleTo = 0.96,
    disabled = false
}: ScalePressableProps) {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!disabled) HapticFeedback.light();
        Animated.spring(scaleValue, {
            toValue: scaleTo,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={disabled ? undefined : handlePressIn}
            onPressOut={disabled ? undefined : handlePressOut}
            disabled={disabled}
            style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
        >
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                {children}
            </Animated.View>
        </Pressable>
    );
}
