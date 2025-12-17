import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_STORAGE_KEY = 'babyrons_scheduled_notifications';

// Configuration du handler pour afficher les notifications même app ouverte
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Demande les permissions pour les notifications
 */
export async function registerForPushNotificationsAsync() {
    let token;

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permission de notification non accordée!');
            return;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    } catch (error) {
        console.log('Erreur lors de la demande de permissions (ignorer si sur Expo Go):', error);
    }

    return token;
}

interface BabyNotificationData {
    feedingIds: string[];
    diaperId?: string;
}

type NotificationStorage = Record<string, BabyNotificationData>;

/**
 * Planifie les rappels de biberon (3h, 4h, 5h, 6h, 7h, 8h)
 */
export async function scheduleFeedingNotification(babyId: string, babyName: string, feedingTime: number = Date.now()) {
    try {
        // 1. Annuler les anciennes notifications
        await cancelFeedingNotification(babyId);

        const newIds: string[] = [];
        const hoursToSchedule = [3, 4, 5, 6, 7, 8]; // Rappels successifs

        for (const hour of hoursToSchedule) {
            const targetTime = feedingTime + (hour * 60 * 60 * 1000);
            const now = Date.now();
            const triggerSeconds = Math.floor((targetTime - now) / 1000);

            if (triggerSeconds <= 0) continue; // Déjà passé

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: hour === 3 ? "🍼 C'est l'heure du biberon ?" : `⏰ Rappel Biberon (+${hour}h)`,
                    body: `Cela fait ${hour}h que ${babyName} n'a pas mangé.`,
                    sound: true,
                    data: { babyId, type: 'feeding_reminder' },
                },
                trigger: {
                    seconds: triggerSeconds,
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    repeats: false,
                },
            });
            newIds.push(notificationId);
        }

        if (newIds.length > 0) {
            await updateStorage(babyId, (data) => ({ ...data, feedingIds: newIds }));
            console.log(`[Notifications] ${newIds.length} rappels programmés pour ${babyName} (Biberon)`);
        }
    } catch (error) {
        console.error("[Notifications] Erreur planif biberon:", error);
    }
}

/**
 * Planifie une alerte couche sale (24h sans selle)
 */
export async function scheduleDiaperNotification(babyId: string, babyName: string, diaperTime: number = Date.now()) {
    try {
        await cancelDiaperNotification(babyId);

        const targetTime = diaperTime + (24 * 60 * 60 * 1000); // +24h
        const now = Date.now();
        const triggerSeconds = Math.floor((targetTime - now) / 1000);

        if (triggerSeconds <= 0) return;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: "⚠️ Alerte Couche",
                body: `Cela fait 24h que ${babyName} n'a pas fait de selle.`,
                sound: true,
                data: { babyId, type: 'diaper_reminder' },
            },
            trigger: {
                seconds: triggerSeconds,
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                repeats: false,
            },
        });

        await updateStorage(babyId, (data) => ({ ...data, diaperId: notificationId }));
        console.log(`[Notifications] Rappel couche programmé pour ${babyName} dans ${(triggerSeconds / 3600).toFixed(1)}h`);
    } catch (error) {
        console.error("[Notifications] Erreur planif couche:", error);
    }
}

/**
 * Annule les rappels de biberon
 */
export async function cancelFeedingNotification(babyId: string) {
    try {
        const data = await getStorageData();
        const ids = data[babyId]?.feedingIds || [];

        for (const id of ids) {
            await Notifications.cancelScheduledNotificationAsync(id);
        }

        if (ids.length > 0) {
            console.log(`[Notifications] ${ids.length} rappels biberon annulés pour ${babyId}`);
            await updateStorage(babyId, (d) => ({ ...d, feedingIds: [] }));
        }
    } catch (error) {
        console.error("[Notifications] Erreur annulation biberon:", error);
    }
}

/**
 * Annule le rappel couche
 */
export async function cancelDiaperNotification(babyId: string) {
    try {
        const data = await getStorageData();
        const id = data[babyId]?.diaperId;

        if (id) {
            await Notifications.cancelScheduledNotificationAsync(id);
            console.log(`[Notifications] Rappel couche annulé pour ${babyId}`);
            await updateStorage(babyId, (d) => ({ ...d, diaperId: undefined }));
        }
    } catch (error) {
        console.error("[Notifications] Erreur annulation couche:", error);
    }
}

// Helpers Storage
async function getStorageData(): Promise<NotificationStorage> {
    const raw = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
}

async function updateStorage(babyId: string, updater: (data: BabyNotificationData) => BabyNotificationData) {
    const store = await getStorageData();
    const currentCallbackData = store[babyId] || { feedingIds: [] };
    store[babyId] = updater(currentCallbackData);
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(store));
}

/**
 * Planifie une notification de test dans 5 secondes
 */
export async function scheduleTestNotification() {
    await registerForPushNotificationsAsync(); // Assurez-vous d'avoir les permissions

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🔔 Test de notification",
            body: "Ceci est une notification de test pour Babyrons !",
            sound: true,
        },
        trigger: {
            seconds: 5,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            repeats: false,
        },
    });
}
