import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

const SCAN_OPTIONS = [
  {
    icon: 'chatbubble-ellipses-outline' as const,
    title: 'Analyse Message',
    description: 'Paste an SMS, WhatsApp message, or email to check for scam indicators.',
    tags: ['SMS', 'WhatsApp', 'Email'],
    route: '/analysis/message',
    color: Colors.primary,
  },
  {
    icon: 'image-outline' as const,
    title: 'Scan Screenshot (OCR)',
    description: 'Select a chat screenshot or take a photo to extract and analyse suspicious text.',
    tags: ['Gallery', 'Camera', 'OCR'],
    route: '/analysis/image',
    color: '#EC4899',
  },
  {
    icon: 'link' as const,
    title: 'Check Suspicious Link',
    description: 'Paste a URL to analyse its domain, security, and risk characteristics.',
    tags: ['URLs', 'Phishing', 'Links'],
    route: '/analysis/link',
    color: '#8B5CF6',
  },
  {
    icon: 'qr-code-outline' as const,
    title: 'Scan QR Code',
    description: 'Use your camera to scan a QR code and check where it leads before opening.',
    tags: ['Camera', 'QR', 'Links'],
    route: '/analysis/qr',
    color: '#059669',
  },
  {
    icon: 'alert-circle' as const,
    title: 'Emergency SOS Protocol',
    description: 'If you transferred money or shared an OTP: 1-tap call 1930 & bank freeze protocol.',
    tags: ['Helpline 1930', 'Bank Freeze', 'FIR Draft'],
    route: '/tools/sos',
    color: Colors.critical,
  },
];

export default function ScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="scan" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Scan & Analyse</Text>
        </View>
        <Text style={styles.subtitle}>Choose what you want to check for scams or fraud.</Text>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.disclaimerText}>ScamLens assists in detecting potential scams. Results are not a guarantee of safety or fraud. Always use your own judgement.</Text>
        </View>

        {SCAN_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.title}
            style={styles.optionCard}
            onPress={() => router.push(opt.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: opt.color + '22' }]}>
              <Ionicons name={opt.icon} size={32} color={opt.color} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Text style={styles.optionDesc}>{opt.description}</Text>
              <View style={styles.tagsRow}>
                {opt.tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { borderColor: opt.color + '55' }]}>
                    <Text style={[styles.tagText, { color: opt.color }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.safe} />
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
            <Text style={styles.privacyBody}>
              Message content is processed for analysis only. No raw message text is stored without your explicit action. AI analysis is performed server-side. Local rule-based analysis never leaves your device.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.lg },
  headerTitle: { fontSize: Typography.fontSizes['2xl'], fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, marginBottom: Spacing.base, lineHeight: 22 },
  disclaimer: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primary + '11', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '33' },
  disclaimerText: { flex: 1, fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: Spacing.md, gap: 14, ...Shadows.sm },
  optionIcon: { width: 60, height: 60, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  optionDesc: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1 },
  tagText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  privacyCard: { flexDirection: 'row', gap: 12, backgroundColor: Colors.safe + '11', borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.safe + '33', marginTop: Spacing.md },
  privacyTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.safe, marginBottom: 4 },
  privacyBody: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
});
