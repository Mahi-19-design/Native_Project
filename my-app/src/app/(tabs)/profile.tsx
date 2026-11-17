import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser, stats, clearReports } = useApp();
  const [notifications, setNotifications] = useState(false);
  const [autoDetect, setAutoDetect] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@scamlens_token');
          setUser(null);
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your local scan history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearReports() },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.authBadge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.safe} />
                <Text style={styles.authBadgeText}>Authenticated</Text>
              </View>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>Sign in to sync your reports</Text>
              <View style={styles.authRow}>
                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={() => router.push('/auth/login' as any)}
                >
                  <Text style={styles.signInBtnText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={() => router.push('/auth/register' as any)}
                >
                  <Text style={styles.registerBtnText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
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

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            icon="notifications-outline"
            label="Security Alerts"
            desc="Receive notifications for high-risk detections"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                thumbColor={notifications ? Colors.primary : Colors.textMuted}
                trackColor={{ true: Colors.primary + '44', false: Colors.surfaceBorder }}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="eye-outline"
            label="Auto-Detection"
            desc="Requires notification access permission (native build only)"
            iconColor={Colors.caution}
            right={
              <Switch
                value={autoDetect}
                onValueChange={setAutoDetect}
                thumbColor={autoDetect ? Colors.caution : Colors.textMuted}
                trackColor={{ true: Colors.caution + '44', false: Colors.surfaceBorder }}
              />
            }
          />
        </View>

        {/* Data & Privacy */}
        <Text style={styles.sectionLabel}>Data & Privacy</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            icon="document-text-outline"
            label="Detection History"
            desc={`${stats.total} records stored locally`}
            onPress={() => router.push('/(tabs)/reports' as any)}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trash-outline"
            label="Clear Local History"
            desc="Delete all locally stored reports"
            onPress={handleClearData}
            iconColor={Colors.highRisk}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.settingsCard}>
          <SettingRow
            icon="information-circle-outline"
            label="About ScamLens"
            desc="Version 1.0.0 — Think Before You Click"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="book-outline"
            label="Scam Education Centre"
            onPress={() => router.push('/(tabs)/learn' as any)}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="globe-outline"
            label="Report Cyber Crime"
            desc="cybercrime.gov.in · Helpline: 1930"
          />
        </View>

        {/* Logout */}
        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={Colors.highRisk} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          ScamLens — Think Before You Click{'\n'}
          Detection results are not a guarantee of safety or fraud.
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon, label, desc, onPress, right, iconColor = Colors.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {desc ? <Text style={styles.settingDesc}>{desc}</Text> : null}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'], fontWeight: '800',
    color: Colors.textPrimary, paddingVertical: Spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    gap: 16, marginBottom: Spacing.xl, alignItems: 'flex-start',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: Typography.fontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  authBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  authBadgeText: { fontSize: 11, color: Colors.safe, fontWeight: '600' },
  authRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  signInBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
  },
  signInBtnText: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.white },
  registerBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  registerBtnText: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: Typography.fontSizes['2xl'], fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: Colors.surfaceBorder },
  sectionLabel: {
    fontSize: Typography.fontSizes.sm, fontWeight: '700',
    color: Colors.textSecondary, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xl, overflow: 'hidden',
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: Typography.fontSizes.base, fontWeight: '600', color: Colors.textPrimary },
  settingDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.surfaceBorder, marginLeft: 66 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
    backgroundColor: Colors.highRisk + '11',
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.highRisk + '44',
    marginBottom: Spacing.xl,
  },
  logoutBtnText: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.highRisk },
  footerText: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

