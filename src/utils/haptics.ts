import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Wrapper for simplified haptic feedback
// "Soft Modern" philosophy: use light or medium impacts mostly.

export const HapticFeedback = {
    light: () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    },
    medium: () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    },
    heavy: () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    },
    success: () => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    },
    error: () => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    },
    selection: () => {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
    }
};
