import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../../context/AppContext';
import { analyzeUrl } from '../../services/ruleEngine';
import { analysisService } from '../../services/apiService';
import { Colors, Typography, Spacing, BorderRadius, Shadows, getRiskColors } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { RiskBadge } from '../../components/ui/RiskBadge';
import type { ScanReport } from '../../context/AppContext';

interface UrlResult {
  riskScore: number;
  riskLevel: string;
  characteristics: string[];
  recommendations: string[];
  domainInfo: {
    domain: string;
    isHttps: boolean;
    hasSubdomain: boolean;
    isShortened: boolean;
    isIPBased: boolean;
  };
}

export default function LinkAnalysisScreen() {
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const router = useRouter();
  const { addReport } = useApp();
  const [url, setUrl] = useState(prefill ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlResult | null>(null);

  useEffect(() => {
    if (prefill) setUrl(prefill);
  }, [prefill]);

  const handlePaste = async () => {
    const clip = await Clipboard.getStringAsync();
    if (clip) setUrl(clip);
  };

  const handleAnalyse = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('No URL', 'Please paste a URL to analyse.');
      return;
    }

    setLoading(true);
    setResult(null);

    let analysisResult: UrlResult;

    try {
      const aiResult = await analysisService.analyzeUrl(trimmed);
      if (aiResult && typeof aiResult.riskScore === 'number') {
        analysisResult = aiResult;
      } else {
        analysisResult = analyzeUrl(trimmed) as UrlResult;
      }
    } catch {
      analysisResult = analyzeUrl(trimmed) as UrlResult;
    }

    setResult(analysisResult);

    // Save to history
    const report: ScanReport = {
      id: Date.now().toString(),
      type: 'url',
      content: trimmed,
      riskScore: analysisResult.riskScore,
      riskLevel: analysisResult.riskLevel as any,
      category: 'URL Analysis',
      summary: `URL analysis of ${analysisResult.domainInfo.domain}. Risk score: ${analysisResult.riskScore}/100.`,
      indicators: analysisResult.characteristics.map((c) => ({
        name: c,
        explanation: c,
      })),
      recommendations: analysisResult.recommendations,
      urls: [trimmed],
      confidence: 0.8,
      analysisMethod: 'rule-based',
      timestamp: new Date().toISOString(),
      saved: false,
    };
    await addReport(report);
    setLoading(false);
  };

  const rc = result ? getRiskColors(result.riskLevel) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Check Link" subtitle="Analyse a suspicious URL" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* URL Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Paste the URL to analyse</Text>
          <TextInput
            style={styles.urlInput}
            value={url}
            onChangeText={(v) => { setUrl(v); setResult(null); }}
            placeholder="https://example.com/suspicious-link"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputBtn} onPress={handlePaste}>
              <Ionicons name="clipboard-outline" size={15} color={Colors.primary} />
              <Text style={styles.inputBtnText}>Paste</Text>
            </TouchableOpacity>
            {url.length > 0 && (
              <TouchableOpacity
                style={[styles.inputBtn, { backgroundColor: Colors.surfaceElevated }]}
                onPress={() => { setUrl(''); setResult(null); }}
              >
                <Ionicons name="close-outline" size={15} color={Colors.textSecondary} />
                <Text style={[styles.inputBtnText, { color: Colors.textSecondary }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningBanner}>
          <Ionicons name="shield-outline" size={16} color={Colors.caution} />
          <Text style={styles.warningText}>
            ScamLens will NOT automatically open this URL. You are always in control.
          </Text>
        </View>

        {/* Analyse Button */}
        <TouchableOpacity
          style={[styles.analyseBtn, (!url.trim() || loading) && styles.disabled]}
          onPress={handleAnalyse}
          disabled={!url.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="search" size={20} color={Colors.white} />
              <Text style={styles.analyseBtnText}>Analyse URL</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {result && rc && (
          <>
            {/* Risk Summary */}
            <View style={[styles.resultCard, { borderColor: rc.accent + '44' }]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={result.riskLevel === 'LOW' ? 'shield-checkmark' : result.riskLevel === 'CAUTION' ? 'warning' : 'alert-circle'}
                  size={32}
                  color={rc.accent}
                />
                <View style={{ flex: 1 }}>
                  <RiskBadge riskLevel={result.riskLevel} score={result.riskScore} />
                  <Text style={styles.domainText}>{result.domainInfo.domain}</Text>
                </View>
              </View>

              {/* Domain Info */}
              <View style={styles.domainInfoGrid}>
                <DomainPill
                  label="HTTPS"
                  value={result.domainInfo.isHttps}
                  good={result.domainInfo.isHttps}
                />
                <DomainPill
                  label="Shortened"
                  value={result.domainInfo.isShortened}
                  good={!result.domainInfo.isShortened}
                />
                <DomainPill
                  label="IP-based"
                  value={result.domainInfo.isIPBased}
                  good={!result.domainInfo.isIPBased}
                />
                <DomainPill
                  label="Subdomain"
                  value={result.domainInfo.hasSubdomain}
                  good={!result.domainInfo.hasSubdomain}
                />
              </View>
            </View>

            {/* Characteristics */}
            {result.characteristics.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Risk Characteristics</Text>
                {result.characteristics.map((c, i) => (
                  <View key={i} style={styles.characteristicItem}>
                    <Ionicons name="warning-outline" size={15} color={rc.accent} />
                    <Text style={styles.characteristicText}>{c}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {result.recommendations.map((rec, i) => (
                <View key={i} style={styles.recItem}>
                  <View style={styles.recBullet}>
                    <Text style={styles.recBulletText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.disclaimer}>
              This analysis is performed locally using domain pattern matching. It does not access or visit the URL. For verified threat intelligence, backend services must be connected.
            </Text>

            {/* Analyse Another */}
            <TouchableOpacity
              style={styles.anotherBtn}
              onPress={() => { setUrl(''); setResult(null); }}
            >
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
              <Text style={styles.anotherBtnText}>Check Another URL</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DomainPill({ label, value, good }: { label: string; value: boolean; good: boolean }) {
  const color = good ? Colors.safe : Colors.highRisk;
  return (
    <View style={[domainPillStyles.pill, { borderColor: color + '44', backgroundColor: color + '11' }]}>
      <Ionicons
        name={good ? 'checkmark-circle' : 'close-circle'}
        size={14}
        color={color}
      />
      <Text style={[domainPillStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const domainPillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  label: { fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginTop: Spacing.base,
    ...Shadows.sm,
  },
  inputLabel: { fontSize: Typography.fontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  urlInput: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  inputActions: { flexDirection: 'row', gap: 10, marginTop: Spacing.sm },
  inputBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
  },
  inputBtnText: { fontSize: Typography.fontSizes.sm, fontWeight: '600', color: Colors.primary },
  warningBanner: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.caution + '11',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1, borderColor: Colors.caution + '33',
  },
  warningText: { flex: 1, fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  analyseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    gap: 10,
    ...Shadows.lg,
  },
  disabled: { opacity: 0.5 },
  analyseBtnText: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.white },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    marginTop: Spacing.xl,
    ...Shadows.sm,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.base },
  domainText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  domainInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.sm },
  section: { marginTop: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.fontSizes.md, fontWeight: '700',
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  characteristicItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  characteristicText: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: Spacing.md },
  recBullet: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  recBulletText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  recText: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  disclaimer: {
    fontSize: Typography.fontSizes.xs, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 18,
    marginTop: Spacing.xl, paddingHorizontal: Spacing.lg,
  },
  anotherBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.primary,
    backgroundColor: Colors.primary + '11',
    marginTop: Spacing.xl,
  },
  anotherBtnText: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.primary },
});

