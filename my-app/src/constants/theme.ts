export const Colors = {
  background: '#0A0F1E',
  surface: '#131929',
  surfaceElevated: '#1A2235',
  surfaceBorder: '#1E2D45',
  textPrimary: '#F0F4FF',
  textSecondary: '#8B9BB4',
  textMuted: '#4A5568',
  primary: '#3B7FFF',
  primaryLight: '#6B9FFF',
  primaryDark: '#2460CC',
  safe: '#10B981',
  safeLight: '#D1FAE5',
  safeText: '#065F46',
  caution: '#F59E0B',
  cautionLight: '#FEF3C7',
  cautionText: '#92400E',
  highRisk: '#EF4444',
  highRiskLight: '#FEE2E2',
  highRiskText: '#991B1B',
  critical: '#DC2626',
  criticalLight: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
  divider: '#1E2D45',
};

export const Typography = {
  fontSizes: { xs: 11, sm: 13, base: 15, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32 },
  fontWeights: { normal: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const, extrabold: '800' as const },
  lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
};

export const Spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 40, '4xl': 48 };

export const BorderRadius = { sm: 6, md: 10, lg: 14, xl: 18, '2xl': 24, full: 9999 };

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  lg: { shadowColor: '#3B7FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
};

export const getRiskColors = (riskLevel: string) => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW': return { bg: Colors.safeLight, text: Colors.safeText, accent: Colors.safe, label: 'LOW RISK' };
    case 'CAUTION': return { bg: Colors.cautionLight, text: Colors.cautionText, accent: Colors.caution, label: 'CAUTION' };
    case 'HIGH': return { bg: Colors.highRiskLight, text: Colors.highRiskText, accent: Colors.highRisk, label: 'HIGH RISK' };
    case 'CRITICAL': return { bg: Colors.highRiskLight, text: Colors.highRiskText, accent: Colors.critical, label: 'CRITICAL' };
    default: return { bg: Colors.surfaceElevated, text: Colors.textSecondary, accent: Colors.primary, label: 'UNKNOWN' };
  }
};
