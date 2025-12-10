import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../theme/spacing';
import { BottleEvent, SleepEvent, DiaperEvent } from '../data/types';
import { useBabyStore } from '../state/useBabyStore';
import { MilkWave } from './animations/MilkWave';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9; // Wider card for the bento look
const SPACE_WIDTH = Spacing.md;

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

        const lastSleep = babyEvents
          .filter(e => e.type === 'sleep')
          .sort((a, b) => b.at - a.at)[0] as SleepEvent | undefined;
        const isSleeping = lastSleep && !lastSleep.endAt;

        const lastDiaper = babyEvents
          .filter(e => e.type === 'diaper')
          .sort((a, b) => b.at - a.at)[0] as DiaperEvent | undefined;

        // Gradient & Theme determination
        const gradientColors = baby.gender === 'female' ? Colors.gradients.pink :
          baby.gender === 'male' ? Colors.gradients.blue :
            Colors.gradients.mint;

        // Calculate time since last bottle for the wave animation
        const timeSinceBottle = lastBottle ? (now - lastBottle.at) / 60000 : null;

        return (
          <View key={baby.id} style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Top Section: Avatar & Status */}
              <LinearGradient
                colors={gradientColors}
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
                  <Text style={styles.greeting}>Bonjour,</Text>
                  <Text style={styles.name}>{baby.name} !</Text>
                  <View style={styles.statusPill}>
                    <View style={[styles.statusDot, { backgroundColor: isSleeping ? '#A855F7' : '#F6AD55' }]} />
                    <Text style={styles.statusText}>
                      {isSleeping ? 'Fait de beaux rêves' : 'Prêt à jouer'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Bento Grid Stats */}
              <View style={styles.bentoGrid}>
                {/* Large Box: Bottle */}
                <View style={[styles.bentoBox, styles.bentoLarge]}>
                  <MilkWave timeSinceMinutes={timeSinceBottle} />
                  <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
                    <MaterialCommunityIcons name="baby-bottle" size={24} color="#2B6CB0" />
                  </View>
                  <View>
                    <Text style={styles.bentoLabel}>Dernier repas</Text>
                    <Text style={styles.bentoValue}>
                      {lastBottle ? formatTimeSince(lastBottle.at, now) : '--'}
                    </Text>
                    {lastBottle && (
                      <Text style={styles.bentoSub}>{lastBottle.ml}ml</Text>
                    )}
                  </View>
                </View>

                {/* Column for Sleep & Diaper */}
                <View style={styles.bentoColumn}>
                  <View style={styles.bentoBox}>
                    <View style={[styles.iconBubble, { width: 32, height: 32, backgroundColor: Colors.gradients.lavender[0] }]}>
                      <MaterialCommunityIcons name="sleep" size={18} color="#9F7AEA" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.bentoLabelSmall}>Dodo</Text>
                      <Text style={styles.bentoValueSmall}>
                        {isSleeping
                          ? 'Depuis ' + formatTimeSince(lastSleep!.startAt || lastSleep!.at, now)
                          : lastSleep?.endAt
                            ? formatTimeSince(lastSleep.endAt, now)
                            : '--'
                        }
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bentoBox}>
                    <View style={[styles.iconBubble, { width: 32, height: 32, backgroundColor: Colors.gradients.rose[0] }]}>
                      <MaterialCommunityIcons name="emoticon-poop" size={18} color="#ED8936" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.bentoLabelSmall}>Couche</Text>
                      <Text style={styles.bentoValueSmall}>
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

