import { startOfDay, isSameDay, subDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function getRelativeDateLabel(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();

    if (isSameDay(date, now)) {
        return 'Aujourd\'hui';
    } else if (isSameDay(date, subDays(now, 1))) {
        return 'Hier';
    } else {
        // Format: "Lundi 10 Octobre"
        const formatted = format(date, 'EEEE d MMMM', { locale: fr });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
}

export function groupEventsByDay<T extends { at: number }>(events: T[]): Record<string, T[]> {
    const groups: Record<string, T[]> = {};

    const sorted = [...events].sort((a, b) => b.at - a.at);

    sorted.forEach(event => {
        const label = getRelativeDateLabel(event.at);
        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(event);
    });

    return groups;
}
