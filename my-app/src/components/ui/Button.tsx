import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md', loading, disabled, style, textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' ? styles.textSecondary
              : variant === 'danger' ? styles.textDanger
              : variant === 'ghost' ? styles.textGhost
              : styles.textPrimary,
            size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.surfaceBorder },
  danger: { backgroundColor: Colors.highRisk },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  sizeSm: { paddingHorizontal: 12, paddingVertical: 8 },
  sizeMd: { paddingHorizontal: 20, paddingVertical: 14 },
  sizeLg: { paddingHorizontal: 24, paddingVertical: 16 },
  text: { fontWeight: '600' },
  textPrimary: { color: Colors.white },
  textSecondary: { color: Colors.textPrimary },
  textDanger: { color: Colors.white },
  textGhost: { color: Colors.primary },
  textSm: { fontSize: 13 },
  textMd: { fontSize: 15 },
  textLg: { fontSize: 16 },
});

