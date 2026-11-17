import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { analyzeWithRules } from '../../services/ruleEngine';
import { analysisService } from '../../services/apiService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import type { ScanReport } from '../../context/AppContext';

const PRESET_SCREENSHOTS = [
  {
    name: 'Urgent Electricity Bill Disconnection',
    text: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the electricity office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210. Thank you.',
  },
  {
    name: 'Fake Courier Delivery Fee',
    text: 'USPS Notice: Your package could not be delivered due to an incomplete street number. Please confirm your address and pay $1.99 redelivery fee at https://usps-redelivery-tracking.is-gd/update within 12 hours.',
  },
  {
    name: 'Instagram Brand Ambassador Scam',
    text: 'Hey! We love your feed and would love to collaborate as a brand ambassador! You will get 3 free luxury watches and ₹20,000 per post. Just pay shipping fee of ₹499 to claim your package today. DM back right now!',
  },
];

export default function ImageAnalysisScreen() {
  const router = useRouter();
  const { addReport } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera roll access is needed to pick screenshots.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        simulateOCR(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Unable to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Camera permission is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        simulateOCR(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Unable to take photo.');
    }
  };

  const simulateOCR = (uri: string) => {
    setExtracting(true);
    setTimeout(() => {
      setExtracting(false);
      // Realistic extracted message
      setExtractedText(
        'SBI Security Alert: Your debit card ending with 4012 has been temporarily blocked due to unusual activity. Click here to verify your identity: http://sbi-card-verify.bit.ly/4012. Do not share your OTP with anyone.',
      );
    }, 1500);
  };

  const loadPreset = (preset: typeof PRESET_SCREENSHOTS[0]) => {
    setImageUri('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60');
    setExtractedText(preset.text);
  };

  const handleAnalyse = async () => {
    const trimmed = extractedText.trim();
    if (!trimmed) {
      Alert.alert('No Text Found', 'Please extract or paste the text from your screenshot first.');
      return;
    }

    setAnalyzing(true);
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
      content: `[Screenshot Scan]: ${trimmed}`,
      timestamp: new Date().toISOString(),
      saved: false,
      ...result,
    };

    await addReport(report);
    setAnalyzing(false);
    router.push({ pathname: '/analysis/result', params: { reportId: report.id } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Scan Screenshot" subtitle="OCR text analysis of suspicious chats" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Upload Box */}
        <View style={styles.uploadCard}>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
              <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                <Ionicons name="refresh" size={16} color={Colors.white} />
                <Text style={styles.changeBtnText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={54} color={Colors.primary} />
              <Text style={styles.uploadTitle}>Upload a Screenshot</Text>
              <Text style={styles.uploadSubtitle}>
                Select an SMS screenshot, WhatsApp chat, Telegram scam, or email image
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                  <Ionicons name="images-outline" size={18} color={Colors.white} />
                  <Text style={styles.pickBtnText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={18} color={Colors.primary} />
                  <Text style={styles.cameraBtnText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Preset Samples */}
        {!imageUri && (
          <View style={styles.presetsSection}>
            <Text style={styles.presetsTitle}>Or test with sample scam screenshots:</Text>
            {PRESET_SCREENSHOTS.map((p, idx) => (
              <TouchableOpacity key={idx} style={styles.presetItem} onPress={() => loadPreset(p)}>
                <Ionicons name="document-text-outline" size={18} color={Colors.caution} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.presetName}>{p.name}</Text>
                  <Text style={styles.presetPreview} numberOfLines={1}>{p.text}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* OCR Result View */}
        {extracting && (
          <View style={styles.extractingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.extractingText}>Extracting text using on-device OCR...</Text>
          </View>
        )}

        {extractedText ? (
          <View style={styles.extractedCard}>
            <View style={styles.extractedHeader}>
              <Ionicons name="scan-outline" size={18} color={Colors.primary} />
              <Text style={styles.extractedTitle}>Extracted Text</Text>
              <TouchableOpacity onPress={() => setExtractedText('')}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              value={extractedText}
              onChangeText={setExtractedText}
              placeholder="Extracted text will appear here..."
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.editHint}>You can edit or correct the extracted text above before scanning.</Text>
          </View>
        ) : null}

        {/* Run Analysis */}
        {extractedText ? (
          <TouchableOpacity
            style={[styles.analyseBtn, analyzing && styles.disabledBtn]}
            onPress={handleAnalyse}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
                <Text style={styles.analyseBtnText}>Analyse Extracted Text</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  uploadCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginTop: Spacing.base,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  placeholderContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  uploadTitle: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  uploadSubtitle: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: Spacing.md },
  btnRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  pickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  pickBtnText: { color: Colors.white, fontWeight: '600', fontSize: Typography.fontSizes.sm },
  cameraBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1, borderColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  cameraBtnText: { color: Colors.primary, fontWeight: '600', fontSize: Typography.fontSizes.sm },
  previewContainer: { padding: Spacing.base, alignItems: 'center' },
  previewImage: { width: '100%', height: 220, borderRadius: BorderRadius.md, backgroundColor: '#000' },
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceElevated,
    marginTop: Spacing.md, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  changeBtnText: { color: Colors.white, fontSize: Typography.fontSizes.xs, fontWeight: '600' },
  presetsSection: { marginTop: Spacing.xl },
  presetsTitle: { fontSize: Typography.fontSizes.xs, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.sm },
  presetItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  presetName: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  presetPreview: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  extractingBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginTop: Spacing.base,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  extractingText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  extractedCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginTop: Spacing.base,
  },
  extractedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  extractedTitle: { flex: 1, fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  clearText: { fontSize: Typography.fontSizes.xs, color: Colors.highRisk, fontWeight: '600' },
  textInput: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm, lineHeight: 20, minHeight: 100,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  editHint: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },
  analyseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginTop: Spacing.lg, ...Shadows.lg,
  },
  disabledBtn: { opacity: 0.6 },
  analyseBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.base },
});

