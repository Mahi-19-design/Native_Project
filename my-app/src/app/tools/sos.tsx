import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

const EMERGENCY_HELPLINES = [
  { name: 'National Cyber Crime Portal', number: '1930', desc: 'Govt. Helpline for immediate financial fraud blocking' },
  { name: 'State Bank of India (SBI)', number: '1800112211', desc: 'To immediately freeze cards & accounts' },
  { name: 'HDFC Bank Emergency', number: '18001600', desc: 'To report unauthorized transactions' },
  { name: 'ICICI Bank Fraud Line', number: '18001080', desc: '24/7 dedicated fraud reporting desk' },
  { name: 'Axis Bank Emergency', number: '18604195555', desc: 'Block debit/credit card immediately' },
];

const CONTAINMENT_STEPS = [
  { id: 'freeze', title: '1. Call 1930 or Your Bank to Freeze Funds', detail: 'If you report within 2-4 hours ("Golden Hour"), cyber police can instruct banks to freeze the funds in the scammer\'s account before withdrawal.' },
  { id: 'block_card', title: '2. Block Payment Cards & Reset UPI PIN', detail: 'Open your official banking app and turn off International / E-commerce transactions, or block the card completely.' },
  { id: 'change_pass', title: '3. Change Passwords from a Trusted Device', detail: 'If you entered credentials on a link, immediately change passwords for your Email, Bank, and Social accounts from a different clean device.' },
  { id: 'preserve', title: '4. Preserve Evidence & Screenshots', detail: 'Take screenshots of the message, call records, payment transaction IDs, and URL. Do not delete chats.' },
  { id: 'file_fir', title: '5. Lodge Formal Complaint at cybercrime.gov.in', detail: 'File a formal report online or visit your local cyber police station with the generated draft below.' },
];

export default function SOSScreen() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [amountLost, setAmountLost] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [scammerDetail, setScammerDetail] = useState('');
  const [incidentSummary, setIncidentSummary] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const dialNumber = (num: string) => {
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Unable to dial', `Please dial ${num} directly from your phone app.`);
    });
  };

  const openCyberPortal = () => {
    Linking.openURL('https://cybercrime.gov.in');
  };

  const generateComplaintDraft = () => {
    return `CYBERCRIME FINANCIAL FRAUD COMPLAINT DRAFT
==============================================
Date & Time of Incident: ${new Date().toLocaleString()}
Amount Defrauded: ₹${amountLost || '[Amount]'}
Transaction Reference / UTR / UPI Ref: ${txnRef || '[Transaction Reference ID]'}
Scammer Contact / Link / UPI ID: ${scammerDetail || '[Scammer Phone or Link]'}

BRIEF SUMMARY OF INCIDENT:
${incidentSummary || 'I was targeted by an online fraudster who deceived me into transferring funds / sharing banking credentials under false pretenses.'}

IMMEDIATE ACTIONS TAKEN:
- Bank notified to freeze beneficiary account
- Reported to National Cyber Crime Helpline (1930)

REQUEST:
Please register this complaint, freeze the recipient account holding the funds, and take legal action under the Information Technology Act and Bharatiya Nyaya Sanhita.`;
  };

  const copyDraft = async () => {
    const draft = generateComplaintDraft();
    await Clipboard.setStringAsync(draft);
    setCopied(true);
    Alert.alert('Draft Copied!', 'The complaint text has been copied to your clipboard. Paste it into cybercrime.gov.in.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Emergency Incident Response" subtitle="Immediate action protocol if targeted" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Urgent Banner */}
        <View style={styles.urgentCard}>
          <View style={styles.urgentHeader}>
            <Ionicons name="alert-circle" size={28} color={Colors.critical} />
            <View style={{ flex: 1 }}>
              <Text style={styles.urgentTitle}>ACT FAST: THE GOLDEN HOUR</Text>
              <Text style={styles.urgentDesc}>
                If money was transferred in the last 2-4 hours, calling <Text style={{ fontWeight: '800', color: Colors.critical }}>1930</Text> gives the highest chance of freezing the funds!
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.sosCallBtn} onPress={() => dialNumber('1930')}>
            <Ionicons name="call" size={20} color={Colors.white} />
            <Text style={styles.sosCallText}>Call Cyber Helpline 1930 Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Helplines */}
        <Text style={styles.sectionTitle}>Emergency Bank Fraud Helplines</Text>
        <View style={styles.helplinesList}>
          {EMERGENCY_HELPLINES.map((h, i) => (
            <View key={i} style={styles.helplineCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.helplineName}>{h.name}</Text>
                <Text style={styles.helplineDesc}>{h.desc}</Text>
                <Text style={styles.helplineNumber}>{h.number}</Text>
              </View>
              <TouchableOpacity style={styles.dialBtn} onPress={() => dialNumber(h.number)}>
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
                <Text style={styles.dialBtnText}>Dial</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Step-by-Step Containment */}
        <Text style={styles.sectionTitle}>5-Step Containment Protocol</Text>
        <View style={styles.containmentCard}>
          {CONTAINMENT_STEPS.map((s) => {
            const isDone = completedSteps.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.stepItem, isDone && styles.stepDone]}
                onPress={() => toggleStep(s.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isDone ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isDone ? Colors.safe : Colors.textMuted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>{s.title}</Text>
                  <Text style={styles.stepDetail}>{s.detail}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Police Complaint Generator */}
        <Text style={styles.sectionTitle}>Lodge Official Complaint</Text>
        <View style={styles.complaintCard}>
          <Text style={styles.complaintSubtitle}>
            Fill in quick details to generate an official complaint text for cybercrime.gov.in:
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount Lost (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 15000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={amountLost}
              onChangeText={setAmountLost}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transaction Ref / UTR / UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. UPI/401238912/Paytm"
              placeholderTextColor={Colors.textMuted}
              value={txnRef}
              onChangeText={setTxnRef}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Scammer Contact / Account / Link</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +91 9876543210 or scammer@upi"
              placeholderTextColor={Colors.textMuted}
              value={scammerDetail}
              onChangeText={setScammerDetail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brief Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 70 }]}
              multiline
              placeholder="What happened? (e.g. Claimed to be electricity officer threatening power cut)"
              placeholderTextColor={Colors.textMuted}
              value={incidentSummary}
              onChangeText={setIncidentSummary}
            />
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.copyBtn} onPress={copyDraft}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={Colors.white} />
              <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Complaint Draft'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.portalBtn} onPress={openCyberPortal}>
              <Ionicons name="open-outline" size={18} color={Colors.primary} />
              <Text style={styles.portalBtnText}>cybercrime.gov.in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  urgentCard: {
    backgroundColor: Colors.critical + '15',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.critical + '44',
    marginTop: Spacing.base,
    ...Shadows.md,
  },
  urgentHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: Spacing.md },
  urgentTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '800', color: Colors.critical, letterSpacing: 0.5 },
  urgentDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18, marginTop: 2 },
  sosCallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.critical,
    paddingVertical: 14, borderRadius: BorderRadius.lg,
  },
  sosCallText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.base },
  sectionTitle: {
    fontSize: Typography.fontSizes.md, fontWeight: '700',
    color: Colors.textPrimary, marginTop: Spacing.xl, marginBottom: Spacing.sm,
  },
  helplinesList: { gap: 8 },
  helplineCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  helplineName: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  helplineDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  helplineNumber: { fontSize: Typography.fontSizes.sm, fontWeight: '800', color: Colors.primary, marginTop: 4 },
  dialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  dialBtnText: { color: Colors.primary, fontWeight: '700', fontSize: Typography.fontSizes.xs },
  containmentCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
  },
  stepDone: { opacity: 0.6 },
  stepTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  stepTitleDone: { textDecorationLine: 'line-through' },
  stepDetail: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18, marginTop: 2 },
  complaintCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
    gap: 10,
  },
  complaintSubtitle: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  inputGroup: { marginBottom: 6 },
  label: { fontSize: Typography.fontSizes.xs, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: Typography.fontSizes.sm,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: Spacing.sm },
  copyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: BorderRadius.lg,
  },
  copyBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.xs },
  portalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.primary,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: BorderRadius.lg,
  },
  portalBtnText: { color: Colors.primary, fontWeight: '700', fontSize: Typography.fontSizes.xs },
});

