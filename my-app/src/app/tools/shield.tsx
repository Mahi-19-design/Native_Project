import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { analyzeWithRules } from '../../services/ruleEngine';

// Configure notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface InterceptedItem {
  id: string;
  source: 'SMS' | 'WhatsApp' | 'Telegram';
  sender: string;
  text: string;
  riskLevel: 'LOW' | 'CAUTION' | 'HIGH' | 'CRITICAL';
  category: string;
  timestamp: string;
}

const SAMPLE_INCOMING = [
  {
    source: 'SMS' as const,
    sender: 'VM-SBIINB',
    text: 'Dear customer, your SBI NetBanking account will be blocked today due to incomplete PAN-Aadhaar KYC. Update immediately at http://sbi-pan-kyc.tinyurl.com/update to avoid penalty.',
  },
  {
    source: 'WhatsApp' as const,
    sender: '+91 9988776655',
    text: 'Hello! I am HR Sneha from YouTube Career. You can earn ₹500 per video like from home. No deposit needed. Reply YES to start.',
  },
  {
    source: 'SMS' as const,
    sender: 'AD-SWIGGY',
    text: 'Your Swiggy order #9412 is on the way! Our delivery executive Mohan will deliver your food in 15 mins.',
  },
  {
    source: 'SMS' as const,
    sender: 'BP-ELECT',
    text: 'Urgent: Your electricity bill is pending for disconnect tonight at 8 PM. Pay now by calling electricity executive at 9811223344.',
  },
];

export default function ShieldScreen() {
  const [shieldActive, setShieldActive] = useState(true);
  const [logs, setLogs] = useState<InterceptedItem[]>([]);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const simulateIncomingNotification = async (item: typeof SAMPLE_INCOMING[0]) => {
    if (!shieldActive) {
      Alert.alert('Shield Disabled', 'Enable the Notification Shield switch above to scan notifications.');
      return;
    }

    const analysis = analyzeWithRules(item.text);

    const newLog: InterceptedItem = {
      id: Date.now().toString(),
      source: item.source,
      sender: item.sender,
      text: item.text,
      riskLevel: analysis.riskLevel,
      category: analysis.category,
      timestamp: new Date().toLocaleTimeString(),
    };

    setLogs(prev => [newLog, ...prev]);

    // If High or Critical risk, trigger real local alert notification!
    if (analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🛡️ ScamLens Warning: Suspicious ${item.source}!`,
            body: `[${analysis.category}] ${item.text.slice(0, 80)}... Tap to review safety precautions.`,
            data: { riskLevel: analysis.riskLevel },
          },
          trigger: null, // immediate
        });
      } catch {}
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Notification Shield" subtitle="Automatic real-time background protection" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shield Status Card */}
        <View style={[styles.statusCard, { borderColor: shieldActive ? Colors.safe + '44' : Colors.surfaceBorder }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconWrap, { backgroundColor: shieldActive ? Colors.safe + '22' : Colors.surfaceElevated }]}>
              <Ionicons
                name={shieldActive ? 'shield-checkmark' : 'shield-outline'}
                size={32}
                color={shieldActive ? Colors.safe : Colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>
                {shieldActive ? 'Notification Shield Active' : 'Shield Paused'}
              </Text>
              <Text style={styles.statusSub}>
                {shieldActive
                  ? 'Incoming SMS & messaging alerts are inspected locally on-device'
                  : 'Turn on to monitor incoming alerts for scam patterns'}
              </Text>
            </View>
            <Switch
              value={shieldActive}
              onValueChange={setShieldActive}
              thumbColor={shieldActive ? Colors.safe : Colors.textMuted}
              trackColor={{ true: Colors.safe + '44', false: Colors.surfaceBorder }}
            />
          </View>
        </View>

        {/* Native Android Technical Overview */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="hardware-chip-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoTitle}>Android Native Notification Architecture</Text>
          </View>
          <Text style={styles.infoText}>
            Full cross-app notification interception on Android requires an Android <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>NotificationListenerService</Text> registered in <Text style={{ fontFamily: 'monospace', color: Colors.primary }}>AndroidManifest.xml</Text> with explicit user opt-in in Android Settings → Special App Access.
          </Text>
          <View style={styles.privacyGuarantee}>
            <Ionicons name="lock-closed" size={14} color={Colors.safe} />
            <Text style={styles.privacyText}>100% Local Privacy: Message text never leaves your device during background scans.</Text>
          </View>
        </View>

        {/* Test Simulator */}
        <Text style={styles.sectionTitle}>Simulate Incoming Notifications</Text>
        <Text style={styles.sectionSubtitle}>
          Tap any scenario to test how ScamLens evaluates notifications and pushes high-risk alerts:
        </Text>

        <View style={styles.simButtons}>
          {SAMPLE_INCOMING.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.simBtn}
              onPress={() => simulateIncomingNotification(s)}
            >
              <Ionicons
                name={s.source === 'SMS' ? 'chatbubble-outline' : 'logo-whatsapp'}
                size={18}
                color={Colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.simSender}>{s.sender} ({s.source})</Text>
                <Text style={styles.simPreview} numberOfLines={1}>{s.text}</Text>
              </View>
              <Ionicons name="play" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Interception Activity Log */}
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Interception Audit Log</Text>
          {logs.length > 0 && (
            <TouchableOpacity onPress={() => setLogs([])}>
              <Text style={styles.clearLogsText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyLog}>
            <Ionicons name="notifications-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyLogText}>No notifications simulated yet.</Text>
            <Text style={styles.emptyLogSub}>Tap one of the test buttons above to trigger a live scan.</Text>
          </View>
        ) : (
          logs.map(log => {
            const isHigh = log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL';
            const riskColor = isHigh ? Colors.critical : log.riskLevel === 'CAUTION' ? Colors.caution : Colors.safe;
            return (
              <View key={log.id} style={[styles.logCard, { borderLeftColor: riskColor }]}>
                <View style={styles.logTopRow}>
                  <Text style={styles.logSender}>{log.sender} · {log.source}</Text>
                  <View style={[styles.badge, { backgroundColor: riskColor + '22', borderColor: riskColor + '66' }]}>
                    <Text style={[styles.badgeText, { color: riskColor }]}>{log.riskLevel}</Text>
                  </View>
                </View>
                <Text style={styles.logText}>{log.text}</Text>
                <View style={styles.logBottomRow}>
                  <Text style={styles.logCat}>{log.category}</Text>
                  <Text style={styles.logTime}>{log.timestamp}</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  statusCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, marginTop: Spacing.base,
    ...Shadows.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.textPrimary },
  statusSub: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 17 },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginTop: Spacing.base,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoTitle: { fontSize: Typography.fontSizes.xs, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase' },
  infoText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 19 },
  privacyGuarantee: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.safe + '11', borderRadius: BorderRadius.md,
    padding: 8, marginTop: Spacing.sm,
  },
  privacyText: { fontSize: 11, color: Colors.safe, flex: 1 },
  sectionTitle: { fontSize: Typography.fontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.xl, marginBottom: 4 },
  sectionSubtitle: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 18 },
  simButtons: { gap: 8 },
  simBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  simSender: { fontSize: Typography.fontSizes.xs, fontWeight: '700', color: Colors.textPrimary },
  simPreview: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg },
  clearLogsText: { fontSize: Typography.fontSizes.xs, color: Colors.highRisk, fontWeight: '600' },
  emptyLog: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 6 },
  emptyLogText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  emptyLogSub: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, textAlign: 'center' },
  logCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
    borderLeftWidth: 4, marginTop: Spacing.sm,
  },
  logTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logSender: { fontSize: Typography.fontSizes.xs, fontWeight: '700', color: Colors.textPrimary },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  badgeText: { fontSize: 9, fontWeight: '800' },
  logText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  logBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  logCat: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  logTime: { fontSize: 10, color: Colors.textMuted },
});
