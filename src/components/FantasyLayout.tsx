import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

interface FantasyLayoutProps {
  children: React.ReactNode;
}

export function FantasyLayout({ children }: FantasyLayoutProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        // Aurora Borealis inspired gradient: Deep Blue -> Purple -> Soft Light
        colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
