import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRiskColors, BorderRadius } from '../../constants/theme';

export function RiskBadge({ riskLevel, score }: { riskLevel: string; score?: number }) {
  const c = getRiskColors(riskLevel);
  return (
    <View style={[styles.badge, { backgroundColor: c.accent + '22', borderColor: c.accent + '55' }]}>
      <View style={[styles.dot, { backgroundColor: c.accent }]} />
      <Text style={[styles.label, { color: c.accent }]}>
        {c.label}{score !== undefined ? ` · ${score}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});

