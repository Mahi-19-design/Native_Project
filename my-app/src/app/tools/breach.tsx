import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

interface BreachRecord {
  title: string;
  domain: string;
  breachDate: string;
  pwnCount: string;
  dataClasses: string[];
  description: string;
}

const MOCK_BREACH_DB: Record<string, BreachRecord[]> = {
  'test@example.com': [
    {
      title: 'Global Delivery Network Breach',
      domain: 'deliveryapp.com',
      breachDate: 'August 2024',
      pwnCount: '14,200,000',
      dataClasses: ['Email addresses', 'Passwords (salted SHA-1)', 'Phone numbers', 'Delivery addresses'],
      description: 'In August 2024, an unauthorized party breached internal storage instances and extracted customer profile data.',
    },
    {
      title: 'Social Gaming Network Compromise',
      domain: 'gamezone-online.net',
      breachDate: 'January 2023',
      pwnCount: '8,900,000',
      dataClasses: ['Usernames', 'Email addresses', 'Hashed Passwords'],
      description: 'A misconfigured Elasticsearch cluster exposed user credentials and gameplay telemetry.',
    },
  ],
  'victim@gmail.com': [
    {
      title: 'Major Online Shopping Portal',
      domain: 'megamart.in',
      breachDate: 'November 2023',
      pwnCount: '32,000,000',
      dataClasses: ['Names', 'Email addresses', 'Phone numbers', 'Order histories'],
      description: 'Threat actors auctioned an SQL dump containing customer records on illicit cyber forums.',
    },
  ],
};

export default function BreachRadarScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [breaches, setBreaches] = useState<BreachRecord[]>([]);

  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setSearched(false);

    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      if (MOCK_BREACH_DB[trimmed]) {
        setBreaches(MOCK_BREACH_DB[trimmed]);
      } else if (trimmed.includes('test') || trimmed.includes('leak') || trimmed.includes('admin') || trimmed.includes('9876543210')) {
        // Dynamic simulated match for common demo inputs
        setBreaches([
          {
            title: 'Global E-Commerce Customer Database',
            domain: 'global-shop.com',
            breachDate: 'March 2024',
            pwnCount: '5,400,000',
            dataClasses: ['Email addresses', 'Hashed Passwords', 'Phone numbers'],
            description: 'Compromised via credential stuffing attack against employee API keys.',
          },
        ]);
      } else {
        setBreaches([]);
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Data Leak Radar" subtitle="Check if your email or phone was exposed" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Search Input Box */}
        <View style={styles.searchCard}>
          <Text style={styles.inputLabel}>Enter Email or Mobile Number</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="e.g. yourname@gmail.com or 9876543210"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, (!query.trim() || loading) && styles.disabledBtn]}
            onPress={handleSearch}
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
                <Text style={styles.searchBtnText}>Scan Breaches</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Tip */}
        {!searched && (
          <View style={styles.demoTip}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.demoTipText}>
              Try searching <Text style={{ color: Colors.primary, fontWeight: '700' }}>test@example.com</Text> or <Text style={{ color: Colors.primary, fontWeight: '700' }}>victim@gmail.com</Text> to see breach telemetry.
            </Text>
          </View>
        )}

        {/* Search Results */}
        {searched && (
          <View style={styles.resultsContainer}>
            {breaches.length > 0 ? (
              <>
                <View style={styles.pwnedBanner}>
                  <Ionicons name="alert-circle" size={28} color={Colors.critical} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pwnedTitle}>Compromised in {breaches.length} Data Breach{breaches.length !== 1 ? 'es' : ''}</Text>
                    <Text style={styles.pwnedDesc}>Your data was exposed in public hacker databases. Immediate action recommended!</Text>
                  </View>
                </View>

                {breaches.map((b, idx) => (
                  <View key={idx} style={styles.breachCard}>
                    <View style={styles.breachHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.breachTitle}>{b.title}</Text>
                        <Text style={styles.breachDomain}>{b.domain} · {b.breachDate}</Text>
                      </View>
                      <View style={styles.pwnBadge}>
                        <Text style={styles.pwnBadgeText}>{b.pwnCount} victims</Text>
                      </View>
                    </View>
                    <Text style={styles.breachDesc}>{b.description}</Text>

                    <Text style={styles.compromisedLabel}>Compromised data:</Text>
                    <View style={styles.chipRow}>
                      {b.dataClasses.map((d, i) => (
                        <View key={i} style={styles.dataChip}>
                          <Text style={styles.dataChipText}>{d}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {/* Remediation Guide */}
                <View style={styles.remediationCard}>
                  <Text style={styles.remediationTitle}>Action Plan to Protect Yourself:</Text>
                  <View style={styles.remediationItem}>
                    <Ionicons name="key-outline" size={16} color={Colors.safe} />
                    <Text style={styles.remediationText}>Change your password on any account using this email.</Text>
                  </View>
                  <View style={styles.remediationItem}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={Colors.safe} />
                    <Text style={styles.remediationText}>Enable Two-Factor Authentication (App-based authenticator preferred over SMS).</Text>
                  </View>
                  <View style={styles.remediationItem}>
                    <Ionicons name="mail-unread-outline" size={16} color={Colors.safe} />
                    <Text style={styles.remediationText}>Watch out for targeted phishing emails quoting your leaked info.</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.safeBanner}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.safe} />
                <Text style={styles.safeTitle}>Good News — No Leaks Found!</Text>
                <Text style={styles.safeDesc}>
                  We found no records of <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{query}</Text> in known major publicly leaked breaches.
                </Text>
              </View>
            )}
          </View>
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
  searchCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginTop: Spacing.base, ...Shadows.sm,
  },
  inputLabel: { fontSize: Typography.fontSizes.xs, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  input: { flex: 1, paddingVertical: 12, color: Colors.textPrimary, fontSize: Typography.fontSizes.sm },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 14,
    borderRadius: BorderRadius.lg, marginTop: Spacing.md,
  },
  disabledBtn: { opacity: 0.6 },
  searchBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.sm },
  demoTip: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: Colors.primary + '11', borderRadius: BorderRadius.md,
    padding: Spacing.md, marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '33',
  },
  demoTipText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  resultsContainer: { marginTop: Spacing.xl },
  pwnedBanner: {
    flexDirection: 'row', gap: 12, alignItems: 'center',
    backgroundColor: Colors.critical + '15', borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.critical + '44',
    marginBottom: Spacing.base,
  },
  pwnedTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '800', color: Colors.critical },
  pwnedDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  breachCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md, ...Shadows.sm,
  },
  breachHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  breachTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  breachDomain: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  pwnBadge: { backgroundColor: Colors.highRisk + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  pwnBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.highRisk },
  breachDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18, marginTop: 4, marginBottom: Spacing.sm },
  compromisedLabel: { fontSize: 11, fontWeight: '700', color: Colors.caution, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dataChip: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.surfaceBorder },
  dataChipText: { fontSize: 10, color: Colors.textSecondary },
  remediationCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.safe + '44',
    marginTop: Spacing.base, gap: 8,
  },
  remediationTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.safe, marginBottom: 4 },
  remediationItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  remediationText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  safeBanner: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'], alignItems: 'center',
    borderWidth: 1, borderColor: Colors.safe + '44',
  },
  safeTitle: { fontSize: Typography.fontSizes.lg, fontWeight: '800', color: Colors.safe, marginTop: Spacing.base },
  safeDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});
