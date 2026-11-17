import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Keyboard, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../../context/AppContext';
import { analyzeWithRules } from '../../services/ruleEngine';
import { analysisService } from '../../services/apiService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import type { ScanReport } from '../../context/AppContext';

export default function MessageAnalysisScreen() {
  const router = useRouter();
  const { addReport } = useApp();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePaste = async () => {
    const clipText = await Clipboard.getStringAsync();
    if (clipText) setText(clipText);
  };

  const handleAnalyse = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Empty Message', 'Please paste or type a message to analyse.');
      return;
    }
    if (trimmed.length < 5) {
      Alert.alert('Too Short', 'Please enter a longer message for meaningful analysis.');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    let result: Omit<ScanReport, 'id' | 'type' | 'content' | 'timestamp' | 'saved'>;

    try {
      const aiResult = await analysisService.analyzeMessage(trimmed);
      if (aiResult && typeof aiResult.riskScore === 'number') {
        result = { ...aiResult, analysisMethod: 'ai' as const };
      } else {
        result = analyzeWithRules(trimmed);
      }
    } catch {
      result = analyzeWithRules(trimmed);
    }

    const report: ScanReport = {
      id: Date.now().toString(),
      type: 'message',
      content: trimmed,
      timestamp: new Date().toISOString(),
      saved: false,
      ...result,
    };

    await addReport(report);
    setLoading(false);
    router.push({ pathname: '/analysis/result', params: { reportId: report.id } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Analyse Message" subtitle="Check for scam indicators" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Paste your message below</Text>
            <Text style={styles.charCount}>{text.length} / 5000</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            multiline
            placeholder="Paste an SMS, WhatsApp message, email or any suspicious text here..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
            maxLength={5000}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.inputActionBtn} onPress={handlePaste}>
              <Ionicons name="clipboard-outline" size={16} color={Colors.primary} />
              <Text style={styles.inputActionText}>Paste from Clipboard</Text>
            </TouchableOpacity>
            {text.length > 0 && (
              <TouchableOpacity
                style={[styles.inputActionBtn, styles.clearBtn]}
                onPress={() => { setText(''); inputRef.current?.focus(); }}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.textSecondary} />
                <Text style={[styles.inputActionText, { color: Colors.textSecondary }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Supported types */}
        <View style={styles.sourceHints}>
          <Text style={styles.sourceHintsLabel}>Supported message types:</Text>
          <View style={styles.sourceChips}>
            {['SMS', 'WhatsApp', 'Email', 'Telegram', 'Any text'].map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.safe} />
          <Text style={styles.privacyText}>
            Message content is processed for analysis only. It is not stored without your explicit action. AI analysis is performed on our secure backend. If the backend is unavailable, analysis runs locally on your device.
          </Text>
        </View>

        {/* Analyse button */}
        <TouchableOpacity
          style={[styles.analyseBtn, (!text.trim() || loading) && styles.analyseBtnDisabled]}
          onPress={handleAnalyse}
          disabled={!text.trim() || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
              <Text style={styles.analyseBtnText}>Analyse Message</Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingInfo}>
            <Text style={styles.loadingText}>Analysing with AI + rule engine...</Text>
            <Text style={styles.loadingSubtext}>Usually takes 2–5 seconds</Text>
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
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginTop: Spacing.base,
    ...Shadows.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inputLabel: { fontSize: Typography.fontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  charCount: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted },
  textInput: {
    minHeight: 180,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    lineHeight: 24,
    paddingTop: 4,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    flexWrap: 'wrap',
  },
  inputActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.md,
  },
  clearBtn: { backgroundColor: Colors.surfaceElevated },
  inputActionText: { fontSize: Typography.fontSizes.sm, fontWeight: '600', color: Colors.primary },
  sourceHints: { marginTop: Spacing.base },
  sourceHintsLabel: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  sourceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  chipText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, fontWeight: '500' },
  privacyNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.safe + '11',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.safe + '33',
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  analyseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    gap: 10,
    ...Shadows.lg,
  },
  analyseBtnDisabled: { opacity: 0.5 },
  analyseBtnText: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.white },
  loadingInfo: { alignItems: 'center', marginTop: Spacing.base },
  loadingText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  loadingSubtext: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, marginTop: 4 },
});

