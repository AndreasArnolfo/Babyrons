import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInEntryProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
}

export function FadeInEntry({ children, delay = 0, style }: FadeInEntryProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay,
                useNativeDriver: true,
                bounciness: 8,
            }),
        ]).start();
    }, [delay]);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}
