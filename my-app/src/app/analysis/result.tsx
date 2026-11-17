import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import {
  Colors, Typography, Spacing, BorderRadius, getRiskColors,
} from '../../constants/theme';
import { RiskBadge } from '../../components/ui/RiskBadge';

export default function ResultScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const { reports, toggleSaveReport, deleteReport } = useApp();
  const [feedbackSent, setFeedbackSent] = useState(false);

  const report = useMemo(() => reports.find((r) => r.id === reportId), [reports, reportId]);

  if (!report) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.errorText}>Report not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rc = getRiskColors(report.riskLevel);

  const handleShare = async () => {
    const shareText =
      `ScamLens Analysis Report\n\n` +
      `Risk Level: ${report.riskLevel} (${report.riskScore}/100)\n` +
      `Category: ${report.category}\n\n` +
      `Summary:\n${report.summary}\n\n` +
      `Recommendations:\n${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n` +
      `Analysed by ScamLens — Think Before You Click`;
    await Share.share({ message: shareText });
  };

  const handleDelete = () => {
    Alert.alert('Delete Report', 'Remove this report from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => { await deleteReport(report.id); router.back(); },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Hero */}
        <View style={[styles.riskHero, { borderColor: rc.accent + '44' }]}>
          <View style={[styles.riskIconCircle, { backgroundColor: rc.accent + '22' }]}>
            <Ionicons
              name={
                report.riskLevel === 'LOW'
                  ? 'shield-checkmark'
                  : report.riskLevel === 'CAUTION'
                  ? 'warning'
                  : 'alert-circle'
              }
              size={44}
              color={rc.accent}
            />
          </View>
          <RiskBadge riskLevel={report.riskLevel} score={report.riskScore} />
          <Text style={[styles.riskScore, { color: rc.accent }]}>
            {report.riskScore}
            <Text style={styles.riskScoreUnit}>/100</Text>
          </Text>
          <Text style={styles.riskCategory}>{report.category}</Text>
          <View style={styles.methodBadge}>
            <Ionicons
              name={report.analysisMethod === 'ai' ? 'hardware-chip-outline' : 'flash-outline'}
              size={12}
              color={report.analysisMethod === 'ai' ? Colors.primary : Colors.caution}
            />
            <Text
              style={[
                styles.methodText,
                { color: report.analysisMethod === 'ai' ? Colors.primary : Colors.caution },
              ]}
            >
              {report.analysisMethod === 'ai' ? 'AI-powered analysis' : 'Rule-based analysis (AI unavailable)'}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.card}>
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>
        </View>

        {/* Message Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysed Message</Text>
          <View style={[styles.card, styles.messagePreview]}>
            <Text style={styles.messagePreviewText} numberOfLines={6}>{report.content}</Text>
          </View>
        </View>

        {/* Indicators */}
        {report.indicators.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Suspicious Indicators ({report.indicators.length})
            </Text>
            {report.indicators.map((indicator, idx) => (
              <View
                key={idx}
                style={[styles.indicatorCard, { borderLeftColor: rc.accent }]}
              >
                <View style={styles.indicatorHeader}>
                  <Ionicons name="warning-outline" size={15} color={rc.accent} />
                  <Text style={[styles.indicatorName, { color: rc.accent }]}>{indicator.name}</Text>
                </View>
                <Text style={styles.indicatorExplanation}>{indicator.explanation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Extracted URLs */}
        {report.urls && report.urls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extracted URLs</Text>
            {report.urls.map((url, idx) => (
              <View key={idx} style={styles.urlCard}>
                <Ionicons name="link" size={16} color={Colors.caution} />
                <Text style={styles.urlText} numberOfLines={2}>{url}</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: '/analysis/link', params: { prefill: url } })
                  }
                >
                  <Text style={styles.urlAnalyseBtn}>Analyse</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What To Do</Text>
          {report.recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recItem}>
              <View style={styles.recNumber}>
                <Text style={styles.recNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Confidence */}
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Detection confidence:</Text>
          <Text style={styles.confidenceValue}>{Math.round(report.confidence * 100)}%</Text>
        </View>
        <Text style={styles.disclaimer}>
          This is an automated assessment — not a guarantee of fraud or safety. Always verify independently before taking action.
        </Text>

        {/* Feedback */}
        {!feedbackSent && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Was this detection accurate?</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity
                style={[styles.feedbackBtn, { borderColor: Colors.safe }]}
                onPress={() => { setFeedbackSent(true); Alert.alert('Thank you!', 'Glad the detection was accurate.'); }}
              >
                <Ionicons name="thumbs-up-outline" size={18} color={Colors.safe} />
                <Text style={[styles.feedbackBtnText, { color: Colors.safe }]}>Accurate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackBtn, { borderColor: Colors.highRisk }]}
                onPress={() => { setFeedbackSent(true); Alert.alert('Thank you!', 'Your feedback helps us improve ScamLens.'); }}
              >
                <Ionicons name="thumbs-down-outline" size={18} color={Colors.highRisk} />
                <Text style={[styles.feedbackBtnText, { color: Colors.highRisk }]}>Not accurate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSaveReport(report.id)}>
            <Ionicons name={report.saved ? 'bookmark' : 'bookmark-outline'} size={18} color={Colors.primary} />
            <Text style={styles.saveBtnText}>{report.saved ? 'Saved' : 'Save Report'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newScanBtn}
            onPress={() => router.replace('/analysis/message' as any)}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.white} />
            <Text style={styles.newScanBtnText}>Analyse Another</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color={Colors.highRisk} />
          <Text style={styles.deleteBtnText}>Delete Report</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.textPrimary,
  },
  riskHero: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginTop: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: 10,
  },
  riskIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  riskScore: { fontSize: 52, fontWeight: '800' },
  riskScoreUnit: { fontSize: Typography.fontSizes.xl, fontWeight: '500' },
  riskCategory: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  methodBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  methodText: { fontSize: Typography.fontSizes.sm, fontWeight: '500' },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.fontSizes.md, fontWeight: '700',
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  summaryText: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, lineHeight: 24 },
  messagePreview: { backgroundColor: Colors.surfaceElevated },
  messagePreviewText: {
    fontSize: Typography.fontSizes.sm, color: Colors.textSecondary,
    lineHeight: 20, fontFamily: undefined,
  },
  indicatorCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    borderLeftWidth: 4, marginBottom: Spacing.sm,
  },
  indicatorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  indicatorName: { fontSize: Typography.fontSizes.sm, fontWeight: '700' },
  indicatorExplanation: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  urlCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm, gap: 10,
  },
  urlText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  urlAnalyseBtn: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.primary },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: Spacing.md },
  recNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  recNumberText: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.primary },
  recText: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  confidenceRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginBottom: Spacing.sm,
  },
  confidenceLabel: { fontSize: Typography.fontSizes.sm, color: Colors.textMuted },
  confidenceValue: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textSecondary },
  disclaimer: {
    fontSize: Typography.fontSizes.xs, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 18,
    marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg,
  },
  feedbackCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xl,
  },
  feedbackTitle: {
    fontSize: Typography.fontSizes.sm, fontWeight: '600',
    color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md,
  },
  feedbackRow: { flexDirection: 'row', gap: 12 },
  feedbackBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: BorderRadius.lg,
    borderWidth: 1, backgroundColor: Colors.surfaceElevated,
  },
  feedbackBtnText: { fontSize: Typography.fontSizes.sm, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primary + '11',
  },
  saveBtnText: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.primary },
  newScanBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
  },
  newScanBtnText: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.white },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12,
  },
  deleteBtnText: { fontSize: Typography.fontSizes.sm, color: Colors.highRisk, fontWeight: '500' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: Typography.fontSizes.lg, color: Colors.textSecondary, marginTop: Spacing.base },
  errorBtn: {
    marginTop: Spacing.base, backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.lg,
  },
  errorBtnText: { color: Colors.white, fontWeight: '700' },
});

