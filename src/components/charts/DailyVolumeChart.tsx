import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors } from '../../theme/colors';
import { Spacing, FontSize, BorderRadius } from '../../theme/spacing';
import { DailyVolume } from '../../utils/stats';
import { useAppTheme } from '../../hooks/useAppTheme';

interface DailyVolumeChartProps {
    data: DailyVolume[];
}

const { width } = Dimensions.get('window');

export function DailyVolumeChart({ data }: DailyVolumeChartProps) {
    const theme = useAppTheme();

    if (data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Pas assez de données pour afficher le graphique</Text>
            </View>
        );
    }

    const chartData = data.map(item => ({
        value: item.volume,
        label: item.date,
        frontColor: Colors.pastel.mintActive,
        gradientColor: Colors.pastel.mint,
        topLabelComponent: () => (
            <Text style={{ color: theme.isDark ? theme.colors.textSecondary : Colors.neutral.darkGray, fontSize: 10, marginBottom: 2 }}>
                {item.volume}
            </Text>
        ),
        labelTextStyle: { color: theme.isDark ? theme.colors.textSecondary : Colors.neutral.darkGray },
    }));

    // Calculate dynamic max value for better scaling
    const rawMax = Math.max(...data.map(d => d.volume), 100);
    // Round up to nearest nice number (ticks of 50, 100, 200...)
    const calculateNiceScale = (max: number) => {
        if (max <= 500) return { max: Math.ceil(max / 100) * 100, step: 100 }; // 0, 100, 200...
        if (max <= 1000) return { max: Math.ceil(max / 200) * 200, step: 200 }; // 0, 200, 400...
        return { max: Math.ceil(max / 250) * 250, step: 250 }; // 0, 250, 500...
    };

    const { max: niceMax, step } = calculateNiceScale(rawMax);
    const sections = niceMax / step;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Volumes journaliers (ml)</Text>
            <View style={styles.chartWrapper}>
                <BarChart
                    key={JSON.stringify(chartData)} // Force re-render on data change
                    data={chartData}
                    barWidth={22}
                    spacing={24}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: theme.isDark ? theme.colors.textSecondary : Colors.neutral.darkGray }}
                    noOfSections={sections}
                    maxValue={niceMax}
                    stepValue={step}
                    height={180}
                    width={width - 80}
                    isAnimated={false} // Disable animation to prevent height glitches
                    showGradient
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.neutral.charcoal,
        marginBottom: Spacing.lg,
    },
    chartWrapper: {
        alignItems: 'center',
        paddingRight: Spacing.md,
    },
    emptyContainer: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: Colors.neutral.darkGray,
        fontStyle: 'italic',
    }
});
