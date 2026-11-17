import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/apiService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(email.trim(), password);
      await AsyncStorage.setItem('@scamlens_token', res.token);
      setUser({ ...res.user, token: res.token });
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('Network')) {
        setError('Cannot connect to server. You can still use ScamLens offline with the local rule engine.');
      } else {
        setError(err.message ?? 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="shield" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.logoText}>ScamLens</Text>
            <Text style={styles.tagline}>Think Before You Click</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>
              Sign in to sync your reports across devices. You can also use ScamLens as a guest.
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.highRisk} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(''); }}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => router.replace('/(tabs)' as any)}
            >
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/register' as any)}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 32 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  logoSection: { alignItems: 'center', paddingVertical: Spacing['2xl'] },
  logoIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  logoText: { fontSize: Typography.fontSizes['3xl'], fontWeight: '800', color: Colors.textPrimary },
  tagline: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    ...Shadows.md,
  },
  formTitle: { fontSize: Typography.fontSizes['2xl'], fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  formSubtitle: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.xl },
  errorBanner: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: Colors.highRisk + '11',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1, borderColor: Colors.highRisk + '33',
  },
  errorText: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.highRisk, lineHeight: 18 },
  fieldGroup: { marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.fontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  eyeBtn: { padding: 4 },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadows.lg,
  },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { fontSize: Typography.fontSizes.lg, fontWeight: '700', color: Colors.white },
  guestBtn: {
    alignItems: 'center', paddingVertical: 14,
    marginTop: Spacing.md,
  },
  guestBtnText: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, fontWeight: '500' },
  registerRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.xl,
  },
  registerPrompt: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  registerLink: { fontSize: Typography.fontSizes.sm, color: Colors.primary, fontWeight: '700' },
});

