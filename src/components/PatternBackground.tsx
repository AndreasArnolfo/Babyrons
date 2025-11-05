import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../theme/colors';

interface PatternBackgroundProps {
  children: React.ReactNode;
}

const PATTERN_ITEMS = ['🎂', '🍰', '🎈', '⭐', '🧸', '🎁', '🎪', '🌈'];
const PATTERN_SIZE = 50; // Taille de chaque élément
const PATTERN_SPACING = 140; // Espacement entre les éléments

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PatternBackground({ children }: PatternBackgroundProps) {
  // Créer une grille de motifs répétitifs qui couvre l'écran
  const patternElements: JSX.Element[] = [];
  const rows = Math.ceil(SCREEN_HEIGHT / PATTERN_SPACING) + 2; // +2 pour assurer la couverture
  const cols = Math.ceil(SCREEN_WIDTH / PATTERN_SPACING) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Décalage alterné pour créer un motif en nid d'abeille
      const x = col * PATTERN_SPACING + (row % 2 === 0 ? 0 : PATTERN_SPACING / 2);
      const y = row * PATTERN_SPACING;
      const itemIndex = (row * cols + col) % PATTERN_ITEMS.length;
      // Opacité variable mais toujours très subtile
      const opacity = 0.06 + (row % 4) * 0.015;
      
      patternElements.push(
        <Text
          key={`${row}-${col}`}
          style={[
            styles.patternItem,
            {
              left: x,
              top: y,
              opacity: opacity,
            },
          ]}
        >
          {PATTERN_ITEMS[itemIndex]}
        </Text>
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        <View style={styles.patternContainer} pointerEvents="none">
          {patternElements}
        </View>
      </View>
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.neutral.lightGray,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  patternItem: {
    position: 'absolute',
    fontSize: PATTERN_SIZE,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
});

