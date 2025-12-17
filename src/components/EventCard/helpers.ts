import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event, BottleEvent, SleepEvent, MedEvent, DiaperEvent, GrowthEvent } from '../../data/types';
import { Colors } from '../../theme/colors';

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatTimeForInput(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseTimeInput(timeStr: string, currentTimestamp: number): number {
  if (!timeStr || timeStr.trim() === '') {
    return currentTimestamp;
  }
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return currentTimestamp;
    }
    const date = new Date(currentTimestamp);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  } catch {
    return currentTimestamp;
  }
}

export function formatTimeSince(eventTimestamp: number, currentTime: number = Date.now()): string {
  const diffMs = currentTime - eventTimestamp;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMinutes = Math.floor((diffMs % 3600000) / 60000);

  if (diffHours > 0) {
    return `Il y a ${diffHours}h${diffMinutes > 0 ? `${diffMinutes}min` : ''}`;
  }
  return `Il y a ${diffMinutes} min`;
}

export function getEventIcon(type: string): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type) {
    case 'bottle': return 'baby-bottle';
    case 'sleep': return 'sleep';
    case 'med': return 'pill';
    case 'diaper': return 'emoticon-poop';
    case 'growth': return 'human-male-height';
    case 'meal': return 'food-apple';
    default: return 'circle';
  }
}

export function getEventColor(type: string): string {
  switch (type) {
    case 'bottle': return Colors.pastel.sky;
    case 'sleep': return Colors.pastel.lavender;
    case 'med': return Colors.pastel.rose;
    case 'diaper': return '#D4A574';
    case 'growth': return Colors.pastel.mintActive;
    case 'meal': return Colors.pastel.mintActive; // Vert pour la nourriture saine
    default: return Colors.neutral.darkGray;
  }
}

export function getEventDetails(event: Event): string {
  switch (event.type) {
    case 'meal':
      const meal = event as any; // Cast safely or use MealEvent import
      const foodLabels: Record<string, string> = {
        vegetable: 'Légumes',
        fruit: 'Fruits',
        protein: 'Protéines',
        starch: 'Féculents',
        dairy: 'Laitage',
        cereal: 'Céréales',
      };
      const typeLabel = foodLabels[meal.foodType] || meal.foodType;
      const details = [];
      if (typeLabel) details.push(typeLabel);
      if (meal.note) details.push(meal.note);
      if (meal.amount) details.push(`${meal.amount}g`);

      return details.join(' • ');

    case 'bottle':
      const bottle = event as BottleEvent;
      const kindLabels = {
        breastmilk: 'lait maternel',
        formula: 'préparation',
        mixed: 'mixte',
      };
      const kindLabel = bottle.kind ? ` (${kindLabels[bottle.kind]})` : '';
      return `${bottle.ml} ml${kindLabel}`;

    case 'sleep':
      const sleepEvent = event as SleepEvent;
      if (sleepEvent.duration) {
        const hours = Math.floor(sleepEvent.duration / 3600000);
        const minutes = Math.floor((sleepEvent.duration % 3600000) / 60000);
        if (hours > 0) {
          return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`;
        }
        return `${minutes} min`;
      }
      return 'En cours';

    case 'med':
      const medEvent = event as MedEvent;
      let medDetails = medEvent.name;
      if (medEvent.dose) {
        medDetails += ` - ${medEvent.dose}`;
      }
      return medDetails;

    case 'diaper':
      const diaperEvent = event as DiaperEvent;
      const diaperLabels = {
        wet: 'Mouillée',
        dirty: 'Sale',
        both: 'Les deux',
      };
      return diaperLabels[diaperEvent.kind] || diaperEvent.kind;

    case 'growth':
      const growth = event as GrowthEvent;
      const parts: string[] = [];
      if (growth.weightKg) parts.push(`${growth.weightKg} kg`);
      if (growth.heightCm) parts.push(`${growth.heightCm} cm`);
      if (growth.headCircumferenceCm) parts.push(`PC: ${growth.headCircumferenceCm} cm`);
      return parts.join(' • ') || 'Mesures';

    default:
      return '';
  }
}

export function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'bottle': return 'biberon';
    case 'sleep': return 'sieste';
    case 'med': return 'médicament';
    case 'diaper': return 'couche';
    case 'growth': return 'mesure de croissance';
    case 'meal': return 'repas';
    default: return 'événement';
  }
}

export function getDeleteMessage(event: Event, babyName: string): string {
  const eventDetails = getEventDetails(event);
  const eventTime = formatTime(event.at);

  switch (event.type) {
    case 'bottle':
      return `Supprimer le biberon de ${eventDetails} de ${babyName} à ${eventTime} ?`;

    case 'sleep':
      return `Supprimer la sieste de ${eventDetails} de ${babyName} à ${eventTime} ?`;

    case 'med':
      return `Supprimer le médicament "${eventDetails}" de ${babyName} à ${eventTime} ?`;

    case 'diaper':
      return `Supprimer la couche ${eventDetails.toLowerCase()} de ${babyName} à ${eventTime} ?`;

    case 'growth':
      return `Supprimer la mesure de croissance (${eventDetails}) de ${babyName} à ${eventTime} ?`;

    case 'meal':
      return `Supprimer le repas (${eventDetails}) de ${babyName} à ${eventTime} ?`;

    default:
      return `Supprimer l'événement de ${babyName} à ${eventTime} ?`;
  }
}
