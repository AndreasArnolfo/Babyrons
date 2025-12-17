import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '../../theme/colors';
import { Spacing, FontSize, BorderRadius } from '../../theme/spacing';
import { GrowthPoint } from '../../utils/stats';
import { useAppTheme } from '../../hooks/useAppTheme';
import { WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS, WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, WhoPoint } from '../../data/whoData';
import { Baby } from '../../data/types';

interface GrowthChartProps {
    data: GrowthPoint[];
    type: 'weight' | 'height';
    baby: Baby;
}

const { width } = Dimensions.get('window');

// Linear interpolation for WHO data
function getWhoValue(months: number, dataset: WhoPoint[], percentile: 'p3' | 'p50' | 'p97'): number {
    if (months < 0) return dataset[0][percentile];
    // Find closest lower month
    const lowerIndex = dataset.findIndex((d, i) => d.month <= months && (dataset[i + 1]?.month > months || !dataset[i + 1]));

    if (lowerIndex === -1) return dataset[0][percentile]; // Should not happen
    if (lowerIndex === dataset.length - 1) return dataset[lowerIndex][percentile];

    const lower = dataset[lowerIndex];
    const upper = dataset[lowerIndex + 1];

    const ratio = (months - lower.month) / (upper.month - lower.month);
    return lower[percentile] + (upper[percentile] - lower[percentile]) * ratio;
}

export function GrowthChart({ data, type, baby }: GrowthChartProps) {
    const theme = useAppTheme();

    if (data.length < 2) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.colors.cardBg }]}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Ajoutez au moins 2 mesures de {type === 'weight' ? 'poids' : 'taille'} pour voir la courbe
                </Text>
            </View>
        );
    }

    const chartData = useMemo(() => {
        const gender = baby.gender || 'male'; // Default to male if unknown
        const birthDate = baby.birthDate || Date.now(); // Fallback

        const whoDataset = type === 'weight'
            ? (gender === 'female' ? WHO_WEIGHT_GIRLS : WHO_WEIGHT_BOYS)
            : (gender === 'female' ? WHO_HEIGHT_GIRLS : WHO_HEIGHT_BOYS);

        return data.map(item => {
            // Calculate age in months
            // item.date is formatted string? Need access to timestamp.
            // Assuming item has timestamp or we can parse date. 
            // In stats.ts, extractGrowthData returns { value, date: format(e.at, 'd MMM'), timestamp: e.at } <-- Hopefully?
            // If not, we might need to update stats.ts.
            // Let's assume passed data has `timestamp` or I'll patch it. 
            // Wait, looking at previous view of GrowthChart, it used simplified `date` label.
            // I will assume I need to fix `utils/stats.ts` if `timestamp` is missing.
            // But for now, let's look at `item` as any to check for timestamp.
            // Assuming `item.timestamp` exists for now.

            const timestamp = (item as any).timestamp || Date.now();
            const ageMonths = (timestamp - birthDate) / (1000 * 60 * 60 * 24 * 30.44);

            const p50 = getWhoValue(ageMonths, whoDataset, 'p50');
            const p3 = getWhoValue(ageMonths, whoDataset, 'p3');
            const p97 = getWhoValue(ageMonths, whoDataset, 'p97');

            return {
                value: item.value,
                label: item.date, // Keep original label
                dataPointText: String(item.value),
                labelTextStyle: { color: theme.isDark ? theme.colors.textSecondary : Colors.neutral.darkGray },
                // WHO Reference Data (Secondary lines)
                // Gifted Charts supports `data2`, `data3` etc. BUT they must be array passed to props, NOT inside data object.
                // Wait, verify docs pattern. 
                // Ah, LineChart takes `data`, `data2`, `data3`.
                // So I need to produce 4 arrays.

                // Returning object with all values to be split later or handled here.
                p50, p3, p97
            };
        });
    }, [data, baby, type, theme]);

    // Split into arrays for Gifted Charts
    const babyLine = chartData.map(d => ({ value: d.value, label: d.label, dataPointText: d.dataPointText, labelTextStyle: d.labelTextStyle }));
    const p50Line = chartData.map(d => ({ value: d.p50, dataPointText: '' }));
    const p3Line = chartData.map(d => ({ value: d.p3 }));
    const p97Line = chartData.map(d => ({ value: d.p97 }));

    const color = type === 'weight' ? Colors.pastel.skyActive : Colors.pastel.roseActive;
    const unit = type === 'weight' ? 'kg' : 'cm';
    const title = type === 'weight' ? 'Courbe de Poids (OMS)' : 'Courbe de Taille (OMS)';

    // Find nice max
    const allValues = [
        ...babyLine.map(d => d.value),
        ...p97Line.map(d => d.value)
    ];
    const rawMax = Math.max(...allValues, type === 'weight' ? 5 : 60);

    const calculateNiceScale = (max: number, isWeight: boolean) => {
        if (isWeight) {
            const step = max < 10 ? 1 : 2;
            const niceMax = Math.ceil(max / step) * step + step;
            return { max: niceMax, step, sections: niceMax / step };
        } else {
            const step = 10;
            const niceMax = Math.ceil(max / step) * step + step;
            return { max: niceMax, step, sections: niceMax / step };
        }
    };
    const { max: niceMax, step, sections } = calculateNiceScale(rawMax, type === 'weight');

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title} ({unit})</Text>
            <View style={styles.chartWrapper}>
                <LineChart
                    data={babyLine}
                    data2={p50Line}
                    data3={p97Line}
                    data4={p3Line}
                    height={200}
                    width={width - 80}

                    // Style Line 1 (Baby)
                    color={color}
                    thickness={3}
                    dataPointsColor={color}

                    // Style Line 2 (P50 - Median)
                    color2={theme.isDark ? '#555' : '#AAA'}
                    thickness2={2}
                    dataPointsColor2="transparent"

                    // Style Line 3 (P97 - Top)
                    color3={theme.isDark ? '#333' : '#EEE'}
                    thickness3={1}
                    strokeDashArray3={[5, 5]}
                    dataPointsColor3="transparent"

                    // Style Line 4 (P3 - Bottom)
                    color4={theme.isDark ? '#333' : '#EEE'}
                    thickness4={1}
                    strokeDashArray4={[5, 5]}
                    dataPointsColor4="transparent"

                    textColor={theme.isDark ? theme.colors.text : Colors.neutral.charcoal}
                    curved
                    isAnimated
                    hideRules
                    hideYAxisText={false}
                    yAxisTextStyle={{ color: theme.isDark ? theme.colors.textSecondary : Colors.neutral.darkGray, fontSize: 10 }}
                    xAxisThickness={1}
                    yAxisThickness={0}
                    xAxisColor={Colors.neutral.gray}

                    maxValue={niceMax}
                    noOfSections={sections}
                    stepValue={step}
                />
            </View>
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendLine, { backgroundColor: color, height: 3 }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Bébé</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendLine, { backgroundColor: theme.isDark ? '#555' : '#AAA', height: 2 }]} />
                    <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Moyenne (OMS)</Text>
                </View>
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
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: Colors.neutral.darkGray,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.md,
        gap: Spacing.xl,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    legendLine: {
        width: 16,
        borderRadius: 1,
    },
    legendText: {
        fontSize: 12,
        color: '#718096',
    }
});
