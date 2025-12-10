import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

interface MilkWaveProps {
    timeSinceMinutes: number | null;
    maxMinutes?: number; // Time until "empty" (e.g., 4 hours = 240 mins)
}

export function MilkWave({ timeSinceMinutes, maxMinutes = 240 }: MilkWaveProps) {
    // 0 mins = 100% height
    // 240 mins = 0% height
    const percent = timeSinceMinutes === null
        ? 0
        : Math.max(0, 100 - (timeSinceMinutes / maxMinutes) * 100);

    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);

    useEffect(() => {
        // Wave motion
        translateX.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        translateY.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, []);

    const heightStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(`${percent}%`, { duration: 1000 }),
        };
    });

    const waveStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
        };
    });

    if (timeSinceMinutes === null || percent <= 0) return null;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.waveContainer, heightStyle]}>
                <Animated.View style={[styles.waveSurface, waveStyle]} />
                <View style={styles.body} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: 24, // Matches bento box
        zIndex: 0,
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    waveSurface: {
        height: 10,
        width: '120%', // Wider for movement
        left: '-10%',
        backgroundColor: '#90CDF4', // Slightly darker border for wave top
        borderTopLeftRadius: '50%',
        borderTopRightRadius: '50%',
        opacity: 0.5,
    },
    body: {
        flex: 1,
        backgroundColor: '#BEE3F8', // Liquid color (Blue tint)
        marginTop: -5, // Overlap with wave
    }
});
