import { Event, BottleEvent, GrowthEvent } from '../data/types';
import { startOfDay, startOfWeek, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DailyVolume {
    date: string;
    timestamp: number;
    volume: number;
    count: number;
}

export interface GrowthPoint {
    date: string;
    timestamp: number;
    value: number;
}

export function aggregateDailyBottleVolume(events: Event[]): DailyVolume[] {
    const bottleEvents = events.filter(e => e.type === 'bottle') as BottleEvent[];
    if (bottleEvents.length === 0) return [];

    const volumeMap = new Map<string, { volume: number; count: number; timestamp: number }>();

    bottleEvents.forEach(event => {
        // Use local date string as key to group by day
        const dateKey = format(event.at, 'yyyy-MM-dd');

        if (!volumeMap.has(dateKey)) {
            volumeMap.set(dateKey, {
                volume: 0,
                count: 0,
                timestamp: startOfDay(event.at).getTime()
            });
        }

        const current = volumeMap.get(dateKey)!;
        current.volume += event.ml || 0;
        current.count += 1;
    });

    // Convert to array and sort by date ascending
    return Array.from(volumeMap.entries())
        .map(([date, data]) => ({
            date: format(data.timestamp, 'dd/MM', { locale: fr }),
            timestamp: data.timestamp,
            volume: data.volume,
            count: data.count
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        // Keep only last 7 days for better visibility in simple charts, or 14
        .slice(-7);
}

export function extractGrowthData(events: Event[], type: 'weight' | 'height'): GrowthPoint[] {
    const growthEvents = events.filter(e => e.type === 'growth') as GrowthEvent[];

    return growthEvents
        .filter(e => (type === 'weight' ? e.weightKg : e.heightCm))
        .map(e => ({
            date: format(e.at, 'dd/MM', { locale: fr }),
            timestamp: e.at,
            value: type === 'weight' ? (e.weightKg as number) : (e.heightCm as number)
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
}
