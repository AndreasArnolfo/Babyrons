import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';
import { useBabyStore } from '../state/useBabyStore';

export function useAppTheme() {
    const { settings } = useBabyStore();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initial check
        updateTheme();

        // Check every minute if we need to switch (only useful for auto mode)
        const interval = setInterval(updateTheme, 60000);
        return () => clearInterval(interval);
    }, [settings.themeMode]);

    const updateTheme = () => {
        const mode = settings.themeMode || 'auto';

        if (mode === 'dark') {
            setIsDark(true);
            return;
        }

        if (mode === 'light') {
            setIsDark(false);
            return;
        }

        // Auto mode: Time based
        const hour = new Date().getHours();
        // Dark mode between 18h (6PM) and 8h (8AM)
        const shouldBeDark = hour >= 18 || hour < 8;
        setIsDark(shouldBeDark);
    };

    const theme = {
        colors: isDark ? {
            background: Colors.dark.background,
            surface: Colors.dark.surface,
            text: Colors.dark.text,
            textSecondary: Colors.dark.textSecondary,
            border: Colors.dark.border,
            cardBg: Colors.dark.surface,
            patternColor: '#FFF',
            patternOpacity: Colors.dark.patternOpacity,
            shadow: '#000',
        } : {
            background: Colors.neutral.lightGray,
            surface: Colors.neutral.white,
            text: Colors.neutral.charcoal,
            textSecondary: Colors.neutral.darkGray,
            border: Colors.neutral.gray,
            cardBg: Colors.neutral.white,
            patternColor: '#000',
            patternOpacity: 0.06,
            shadow: '#000',
        },
        isDark
    };

    return theme;
}
