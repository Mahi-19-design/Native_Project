import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedType, setScannedType] = useState<string | null>(null);

  const isUrl = (s: string) => /^https?:\/\//i.test(s) || /^www\./i.test(s);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannedData(data);
    setScannedType(type);
  };

  const handleAnalyseUrl = () => {
    if (scannedData) {
      router.push({ pathname: '/analysis/link', params: { prefill: scannedData } });
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedData(null);
    setScannedType(null);
  };

  // Permission denied state
  if (permission === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Scan QR Code" />
        <View style={styles.centred}>
          <Ionicons name="camera-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.permText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Scan QR Code" />
        <View style={styles.centred}>
          <View style={styles.permIcon}>
            <Ionicons name="camera-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permBody}>
            ScamLens needs camera access to scan QR codes. Your camera is used only for QR scanning and nothing is recorded.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Ionicons name="camera-outline" size={18} color={Colors.white} />
            <Text style={styles.permBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsLink} onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsLinkText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Scanned result
  if (scanned && scannedData) {
    const isLink = isUrl(scannedData);
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="QR Scanned" />
        <View style={styles.centred}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.safe} />
          </View>
          <Text style={styles.resultTitle}>QR Code Decoded</Text>
          <Text style={styles.resultType}>Type: {scannedType}</Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Content:</Text>
            <Text style={styles.resultContent} selectable>{scannedData}</Text>
          </View>

          {isLink && (
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={18} color={Colors.caution} />
              <Text style={styles.warningText}>
                This QR code contains a URL. Analyse it before opening to check for threats.
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            {isLink && (
              <TouchableOpacity style={styles.analyseBtn} onPress={handleAnalyseUrl}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
                <Text style={styles.analyseBtnText}>Analyse This URL</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.scanAgainBtn} onPress={handleScanAgain}>
              <Ionicons name="scan-outline" size={18} color={Colors.primary} />
              <Text style={styles.scanAgainText}>Scan Another</Text>
            </TouchableOpacity>
          </View>

          {!isLink && (
            <Text style={styles.noLinkText}>
              No URL detected in this QR code. The content above is text only.
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Camera viewfinder
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Scan QR Code" subtitle="Point camera at a QR code" />
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
        />
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanHint}>Align the QR code within the frame</Text>
          <View style={styles.scanWarning}>
            <Ionicons name="shield-outline" size={14} color={Colors.caution} />
            <Text style={styles.scanWarningText}>URL will be shown before any navigation</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 24;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  permIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  permTitle: { fontSize: Typography.fontSizes.xl, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  permBody: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  permText: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, marginTop: Spacing.base },
  permBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: BorderRadius.xl, ...Shadows.lg, marginBottom: Spacing.md,
  },
  permBtnText: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.white },
  settingsLink: { paddingVertical: 10 },
  settingsLinkText: { fontSize: Typography.fontSizes.sm, color: Colors.primary, fontWeight: '600' },
  cameraContainer: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 240, height: 240,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: Colors.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER },
  scanHint: { fontSize: Typography.fontSizes.base, color: Colors.white, fontWeight: '600', marginBottom: Spacing.md },
  scanWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 8 },
  scanWarningText: { fontSize: Typography.fontSizes.xs, color: Colors.caution },
  successIcon: { marginBottom: Spacing.base },
  resultTitle: { fontSize: Typography.fontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  resultType: { fontSize: Typography.fontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.xl },
  resultCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.base,
  },
  resultLabel: { fontSize: Typography.fontSizes.xs, fontWeight: '700', color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase' },
  resultContent: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary, lineHeight: 20 },
  warningCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    width: '100%',
    backgroundColor: Colors.caution + '11',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.caution + '33',
    marginBottom: Spacing.xl,
  },
  warningText: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  actionButtons: { width: '100%', gap: 12 },
  analyseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary,
    paddingVertical: 14, borderRadius: BorderRadius.xl, ...Shadows.lg,
  },
  analyseBtnText: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.white },
  scanAgainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1, borderColor: Colors.primary,
    paddingVertical: 14, borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary + '11',
  },
  scanAgainText: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.primary },
  noLinkText: { fontSize: Typography.fontSizes.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.base, lineHeight: 20 },
});

