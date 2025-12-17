import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';
import { BottleEvent, SleepEvent, DiaperEvent } from '../data/types';
import { useBabyStore } from '../state/useBabyStore';
import { MilkWave } from './animations/MilkWave';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9; // Wider card for the bento look
const SPACE_WIDTH = Spacing.md;

// Helper for Age Calculation
function formatPreciseAge(birthDateTimestamp: number | null | undefined): string {
  if (!birthDateTimestamp) return '';
  const birth = new Date(birthDateTimestamp);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    // Get days in previous month
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return `${days} jour${days > 1 ? 's' : ''}`;
  if (years === 0) return `${months} mois${days > 0 ? ` et ${days}j` : ''}`;
  return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` et ${months} mois` : ''}`;
}

function formatTimeSince(timestamp: number, now: number): string {
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes} min`;
}

interface DashboardSummaryProps {
  selectedBabyId: string | null;
}

export function DashboardSummary({ selectedBabyId }: DashboardSummaryProps) {
  const { babies, events } = useBabyStore();
  const theme = useAppTheme();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const relevantBabies = selectedBabyId
    ? babies.filter(b => b.id === selectedBabyId)
    : babies;

  if (relevantBabies.length === 0) return null;

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      snapToInterval={CARD_WIDTH + SPACE_WIDTH}
      decelerationRate="fast"
    >
      {relevantBabies.map(baby => {
        const babyEvents = events.filter(e => e.babyId === baby.id);

        const lastBottle = babyEvents
          .filter(e => e.type === 'bottle')
          .sort((a, b) => b.at - a.at)[0] as BottleEvent | undefined;

        const lastMeal = babyEvents
          .filter(e => e.type === 'meal')
          .sort((a, b) => b.at - a.at)[0] as any | undefined; // Cast to any for now or MealEvent if imported

        const lastSleep = babyEvents
          .filter(e => e.type === 'sleep')
          .sort((a, b) => b.at - a.at)[0] as SleepEvent | undefined;
        const isSleeping = lastSleep && !lastSleep.endAt;

        const lastDiaper = babyEvents
          .filter(e => e.type === 'diaper')
          .sort((a, b) => b.at - a.at)[0] as DiaperEvent | undefined;

        // Determine Last Feeding (Bottle or Meal)
        let lastFeedingVal: { type: 'bottle' | 'meal', at: number, label: string, sub: string, icon: string, color: string, bg: string, borderColor: string } | null = null;

        if (lastBottle && (!lastMeal || lastBottle.at >= lastMeal.at)) {
          lastFeedingVal = {
            type: 'bottle',
            at: lastBottle.at,
            label: 'Dernier biberon',
            sub: `${lastBottle.ml}ml`,
            icon: 'baby-bottle',
            color: '#2B6CB0',
            bg: '#EBF8FF', // Light blue tint
            borderColor: '#BEE3F8'
          };
        } else if (lastMeal) {
          const foodLabels: Record<string, string> = {
            vegetable: 'Légumes', fruit: 'Fruits', protein: 'Protéines', starch: 'Féculents', dairy: 'Laitage', cereal: 'Céréales'
          };
          const label = foodLabels[lastMeal.foodType] || 'Repas';
          lastFeedingVal = {
            type: 'meal',
            at: lastMeal.at,
            label: 'Dernier repas',
            sub: `${label} ${lastMeal.amount ? `(${lastMeal.amount}g)` : ''}`,
            icon: 'food-apple',
            color: '#2F855A',
            bg: '#F0FFF4', // Light green tint
            borderColor: '#C6F6D5'
          };
        }

        // Gradient & Theme determination
        const gradientColors = theme.isDark
          ? (baby.gender === 'female' ? Colors.dark.gradients.pink :
            baby.gender === 'male' ? Colors.dark.gradients.blue :
              Colors.dark.gradients.mint)
          : (baby.gender === 'female' ? Colors.gradients.pink :
            baby.gender === 'male' ? Colors.gradients.blue :
              Colors.gradients.mint);

        // Calculate time since last bottle for the wave animation (only if bottle is last feeding)
        const timeSinceBottle = (lastFeedingVal?.type === 'bottle' && lastBottle) ? (now - lastBottle.at) / 60000 : null;

        return (
          <View key={baby.id} style={styles.cardContainer}>
            <View style={[styles.card, { backgroundColor: theme.colors.cardBg, borderColor: theme.isDark ? theme.colors.border : '#FFF' }]}>
              {/* Top Section: Avatar & Status */}
              <LinearGradient
                colors={gradientColors as any} // Cast to any to avoid readonly issues if needed
                style={styles.heroSection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarContainer}>
                  {baby.photo ? (
                    <Image source={{ uri: baby.photo }} style={styles.avatar} />
                  ) : (
                    <Text style={styles.avatarInitial}>{baby.name.charAt(0)}</Text>
                  )}
                  {isSleeping && (
                    <View style={styles.sleepingBadge}>
                      <MaterialCommunityIcons name="moon-waning-crescent" size={16} color="#FFF" />
                    </View>
                  )}
                </View>

                <View style={styles.heroInfo}>
                  <Text style={[styles.greeting, { color: Colors.modern.textSecondary }]}>Bonjour,</Text>
                  <Text style={[styles.name, { color: Colors.modern.text, marginBottom: 2 }]}>{baby.name} !</Text>
                  {baby.birthDate && (
                    <Text style={[styles.ageText, { color: Colors.modern.textSecondary }]}>{formatPreciseAge(baby.birthDate)}</Text>
                  )}
                  <View style={[styles.statusPill, { marginTop: 6 }]}>
                    <View style={[styles.statusDot, { backgroundColor: isSleeping ? '#A855F7' : '#F6AD55' }]} />
                    <Text style={styles.statusText}>
                      {isSleeping ? 'Fait de beaux rêves' : 'Prêt à jouer'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Bento Grid Stats */}
              <View style={styles.bentoGrid}>
                {/* Large Box: Feeding (Bottle or Meal) */}
                <View style={[
                  styles.bentoBox,
                  styles.bentoLarge,
                  lastFeedingVal
                    ? { backgroundColor: theme.isDark ? theme.colors.background : lastFeedingVal.bg, borderColor: theme.isDark ? theme.colors.border : lastFeedingVal.borderColor }
                    : { backgroundColor: theme.colors.background, borderColor: theme.colors.border }
                ]}>
                  {lastFeedingVal?.type === 'bottle' && <MilkWave timeSinceMinutes={timeSinceBottle} />}
                  <View style={[styles.iconBubble, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }]}>
                    <MaterialCommunityIcons name={lastFeedingVal?.icon as any || 'baby-bottle'} size={24} color={lastFeedingVal?.color || '#2B6CB0'} />
                  </View>
                  <View>
                    <Text style={[styles.bentoLabel, { color: theme.colors.textSecondary }]}>{lastFeedingVal?.label || 'Dernier repas'}</Text>
                    <Text style={[styles.bentoValue, { color: theme.colors.text }]}>
                      {lastFeedingVal ? formatTimeSince(lastFeedingVal.at, now) : '--'}
                    </Text>
                    {lastFeedingVal && (
                      <Text style={[styles.bentoSub, { color: theme.colors.textSecondary }]}>{lastFeedingVal.sub}</Text>
                    )}
                  </View>
                </View>

                {/* Column for Sleep & Diaper */}
                <View style={styles.bentoColumn}>
                  <View style={[styles.bentoBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={[styles.iconBubble, { width: 32, height: 32, backgroundColor: Colors.gradients.lavender[0] }]}>
                      <MaterialCommunityIcons name="sleep" size={18} color="#9F7AEA" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.bentoLabelSmall, { color: theme.colors.textSecondary }]}>Dodo</Text>
                      <Text style={[styles.bentoValueSmall, { color: theme.colors.text, fontSize: 13 }]}>
                        {isSleeping
                          ? `Dort depuis ${formatTimeSince(lastSleep!.startAt || lastSleep!.at, now)}`
                          : lastSleep?.endAt
                            ? `A dormi ${formatTimeSince(lastSleep!.startAt || lastSleep!.at, lastSleep.endAt)} (il y a ${formatTimeSince(lastSleep.endAt, now)})`.replace(' min', 'm')
                            : '--'
                        }
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.bentoBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={[styles.iconBubble, { width: 32, height: 32, backgroundColor: Colors.gradients.rose[0] }]}>
                      <MaterialCommunityIcons name="emoticon-poop" size={18} color="#ED8936" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.bentoLabelSmall, { color: theme.colors.textSecondary }]}>Couche</Text>
                      <Text style={[styles.bentoValueSmall, { color: theme.colors.text }]}>
                        {lastDiaper ? formatTimeSince(lastDiaper.at, now) : '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    gap: SPACE_WIDTH,
  },
  cardContainer: {
    width: CARD_WIDTH,
    // Using simple shadows locally to avoid complexity for now, or match Colors later
    shadowColor: Colors.shadows.medium.shadowColor,
    shadowOffset: Colors.shadows.medium.shadowOffset,
    shadowOpacity: Colors.shadows.medium.shadowOpacity,
    shadowRadius: Colors.shadows.medium.shadowRadius,
    elevation: Colors.shadows.medium.elevation,
  },
  card: {
    backgroundColor: Colors.modern.surface,
    borderRadius: 32, // Super rounded "Squircle"
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 20, // Extra space for overlap if needed, or visual balance
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
    ...Colors.shadows.soft,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.modern.text,
  },
  sleepingBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#805AD5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  heroInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.modern.textSecondary,
    fontWeight: '600',
    opacity: 0.8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.modern.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  ageText: {
    fontSize: 14,
    color: Colors.modern.textSecondary,
    fontWeight: '500',
    opacity: 0.9,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.modern.text,
  },
  bentoGrid: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingTop: 0, // Pull up closer to Hero
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  bentoBox: {
    backgroundColor: '#FAFAFA', // Slightly different from surface
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bentoLarge: {
    flex: 1.2,
    flexDirection: 'column', // Stack icon and text
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#EBF8FF', // Light blue tint for bottle
    borderColor: '#BEE3F8',
    overflow: 'hidden', // Essential for wave clipping
    position: 'relative',
  },
  bentoColumn: {
    flex: 1,
    gap: Spacing.md,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 2,
    fontWeight: '600',
  },
  bentoValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3748',
  },
  bentoSub: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  bentoLabelSmall: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 2,
  },
  bentoValueSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
});

