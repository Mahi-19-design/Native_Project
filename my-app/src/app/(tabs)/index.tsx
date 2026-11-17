import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import {
  Colors, Typography, Spacing, BorderRadius, Shadows, getRiskColors,
} from '../../constants/theme';
import { RiskBadge } from '../../components/ui/RiskBadge';

const SAFETY_TIPS = [
  {
    icon: 'key-outline' as const,
    title: 'Protect Your OTP',
    body: 'Never share your OTP with anyone — not even someone claiming to be from your bank. No legitimate organization will ever ask for it.',
  },
  {
    icon: 'link-outline' as const,
    title: 'Check Links Carefully',
    body: 'Before clicking any link, verify the domain. Scammers use look-alike domains like "paypa1.com" instead of "paypal.com".',
  },
  {
    icon: 'call-outline' as const,
    title: 'Verify Callers',
    body: 'If someone calls claiming to be from your bank or government, hang up and call the official number listed on their website.',
  },
  {
    icon: 'wifi-outline' as const,
    title: 'Avoid Public Wi-Fi',
    body: 'Never access your banking or sensitive accounts on public Wi-Fi. Use mobile data or a trusted VPN.',
  },
  {
    icon: 'lock-closed-outline' as const,
    title: 'Use Strong Passwords',
    body: 'Use unique passwords for each account and enable two-factor authentication wherever possible.',
  },
];

const QUICK_ACTIONS = [
  {
    icon: 'chatbubble-ellipses-outline' as const,
    label: 'Analyse Text',
    desc: 'SMS, WhatsApp, Email',
    route: '/analysis/message',
    color: Colors.primary,
  },
  {
    icon: 'image-outline' as const,
    label: 'Scan Screenshot',
    desc: 'OCR chat image scan',
    route: '/analysis/image',
    color: '#EC4899',
  },
  {
    icon: 'link' as const,
    label: 'Check Link',
    desc: 'Domain threat check',
    route: '/analysis/link',
    color: '#8B5CF6',
  },
  {
    icon: 'qr-code-outline' as const,
    label: 'Scan QR',
    desc: 'Camera safe scanner',
    route: '/analysis/qr',
    color: '#059669',
  },
];

const ADVANCED_TOOLS = [
  {
    icon: 'alert-circle' as const,
    title: 'Emergency SOS Protocol',
    subtitle: 'Dial 1930 & Instant Bank Freezing Checklist',
    route: '/tools/sos',
    color: Colors.critical,
    tag: 'INCIDENT HELP',
  },
  {
    icon: 'game-controller-outline' as const,
    title: 'Scam Simulator Arena',
    subtitle: 'Interactive Threat Decision Scenarios & IQ Test',
    route: '/tools/arena',
    color: '#F59E0B',
    tag: 'TRAINING',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Notification Shield',
    subtitle: 'Test Real-Time Interception & Local Alerts',
    route: '/tools/shield',
    color: Colors.safe,
    tag: 'AUTO GUARD',
  },
  {
    icon: 'finger-print-outline' as const,
    title: 'Data Breach Radar',
    subtitle: 'Check if your Email or Phone is Compromised',
    route: '/tools/breach',
    color: '#06B6D4',
    tag: 'LEAK AUDIT',
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 👋';
  if (h < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

export default function HomeScreen() {
  const router = useRouter();
  const { reports, stats } = useApp();
  const recentReports = reports.slice(0, 5);
  const tip = SAFETY_TIPS[new Date().getDay() % SAFETY_TIPS.length];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoRow}>
              <Ionicons name="shield" size={22} color={Colors.primary} />
              <Text style={styles.logoText}>ScamLens</Text>
            </View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Security Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Security Overview</Text>
              <Text style={styles.statusSubtitle}>
                {stats.total === 0
                  ? 'No scans yet. Start by analysing a message.'
                  : `${stats.total} message${stats.total !== 1 ? 's' : ''} analysed`}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.highRisk }]}>{stats.highRisk}</Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.safe }]}>{stats.safe}</Text>
              <Text style={styles.statLabel}>Safe</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Detection Center</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: action.color + '22' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Advanced Safety Arsenal */}
        <Text style={styles.sectionTitle}>Advanced Safety Arsenal</Text>
        <View style={styles.arsenalContainer}>
          {ADVANCED_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.title}
              style={styles.arsenalCard}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.arsenalIconWrap, { backgroundColor: tool.color + '22' }]}>
                <Ionicons name={tool.icon} size={22} color={tool.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.arsenalTitle}>{tool.title}</Text>
                  <View style={[styles.arsenalTag, { borderColor: tool.color + '55' }]}>
                    <Text style={[styles.arsenalTagText, { color: tool.color }]}>{tool.tag}</Text>
                  </View>
                </View>
                <Text style={styles.arsenalSubtitle}>{tool.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Safety Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeaderRow}>
            <Ionicons name="bulb-outline" size={16} color={Colors.caution} />
            <Text style={styles.tipHeaderLabel}>Safety Tip of the Day</Text>
          </View>
          <View style={styles.tipTitleRow}>
            <Ionicons name={tip.icon} size={20} color={Colors.primary} />
            <Text style={styles.tipTitle}>{tip.title}</Text>
          </View>
          <Text style={styles.tipBody}>{tip.body}</Text>
        </View>

        {/* Recent Detections */}
        {recentReports.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Detections</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/reports' as any)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentReports.map((report) => {
              const c = getRiskColors(report.riskLevel);
              return (
                <TouchableOpacity
                  key={report.id}
                  style={styles.reportCard}
                  onPress={() =>
                    router.push({ pathname: '/analysis/result', params: { reportId: report.id } })
                  }
                  activeOpacity={0.8}
                >
                  <View style={[styles.reportTypeIcon, { backgroundColor: c.accent + '22' }]}>
                    <Ionicons
                      name={
                        report.type === 'message'
                          ? 'chatbubble-outline'
                          : report.type === 'url'
                            ? 'link'
                            : 'qr-code-outline'
                      }
                      size={18}
                      color={c.accent}
                    />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportCategory} numberOfLines={1}>{report.category}</Text>
                    <Text style={styles.reportPreview} numberOfLines={1}>{report.content}</Text>
                    <Text style={styles.reportTime}>
                      {new Date(report.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <RiskBadge riskLevel={report.riskLevel} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {recentReports.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="shield-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyBody}>
              Paste a suspicious message or link to get started.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/analysis/message' as any)}
            >
              <Text style={styles.emptyBtnText}>Analyse a Message</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  greeting: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg },
  statusTitle: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  statusSubtitle: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: Typography.fontSizes['2xl'], fontWeight: '800', color: Colors.primary },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: { width: 1, backgroundColor: Colors.surfaceBorder },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAll: { fontSize: Typography.fontSizes.sm, color: Colors.primary, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  arsenalContainer: { gap: 10, marginBottom: Spacing.xl },
  arsenalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    ...Shadows.sm,
  },
  arsenalIconWrap: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  arsenalTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  arsenalTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm, borderWidth: 1 },
  arsenalTagText: { fontSize: 9, fontWeight: '800' },
  arsenalSubtitle: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.sm,
  },
  actionIconWrap: {
    width: 48, height: 48, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
  tipCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.caution + '33',
    marginBottom: Spacing.xl,
  },
  tipHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  tipHeaderLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.caution,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  tipTitle: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.textPrimary },
  tipBody: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  reportCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm, gap: 12,
  },
  reportTypeIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  reportInfo: { flex: 1 },
  reportCategory: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  reportPreview: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  reportTime: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg, fontWeight: '700',
    color: Colors.textSecondary, marginTop: Spacing.base,
  },
  emptyBody: {
    fontSize: Typography.fontSizes.sm, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.sm, maxWidth: 260, lineHeight: 20,
  },
  emptyBtn: {
    marginTop: Spacing.lg, backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.base },
});
