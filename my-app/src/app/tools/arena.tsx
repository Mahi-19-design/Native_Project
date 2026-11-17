import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

interface Scenario {
  id: number;
  sender: string;
  avatar: string;
  message: string;
  type: string;
  correctAction: 'block' | 'verify' | 'click';
  explanation: string;
  indicators: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    sender: 'TRAI_ALERT',
    avatar: 'call-outline',
    type: 'Digital Arrest / Telecom Threat',
    message: 'TRAI Warning: Your mobile number has been found associated with illegal activities and 17 cyber fraud complaints. Your SIM will be blocked in 2 hours and an arrest warrant has been forwarded to CBI. Contact Inspector Sharma immediately on WhatsApp +91-9876543210.',
    correctAction: 'block',
    explanation: 'Government agencies and TRAI never contact citizens via WhatsApp, nor do they threaten "Digital Arrest" (which is an entirely fabricated scam).',
    indicators: ['Threat of arrest / FIR via SMS', 'WhatsApp contact number for police', 'Artificial 2-hour deadline'],
  },
  {
    id: 2,
    sender: 'SBI_OFFICIAL',
    avatar: 'card-outline',
    type: 'Banking OTP Phishing',
    message: 'Dear Customer, Your SBI NetBanking reward points worth ₹4,850 will expire tonight. Visit http://sbi-reward-points.is-gd/claim to redeem directly into your bank account. Do not share your password with anyone.',
    correctAction: 'block',
    explanation: 'Banks do not send points redemption links through shortened URLs (is.gd). Any site asking for bank login to "claim free cash" is credential theft.',
    indicators: ['Shortened disguise URL (is.gd)', 'Fake urgency (expire tonight)', 'Too-good-to-be-true cash reward'],
  },
  {
    id: 3,
    sender: 'HDFC_BANK',
    avatar: 'shield-checkmark-outline',
    type: 'Legitimate Bank Transaction OTP',
    message: '849102 is your OTP for purchase of Rs. 1,499.00 at AMAZON INDIA using HDFC Card ending 3012 on 17-NOV-2026. Do NOT share OTP with anyone including bank staff.',
    correctAction: 'verify',
    explanation: 'This is a genuine OTP notification from your bank for a specific purchase amount and card ending digits. If YOU initiated this transaction, use the OTP. If you did NOT initiate it, call the bank immediately.',
    indicators: ['Clear transaction amount & merchant', 'Card last 4 digits present', 'Explicit warning not to share OTP'],
  },
  {
    id: 4,
    sender: 'FedEx_Delivery',
    avatar: 'cube-outline',
    type: 'Fake Delivery Customs Fee',
    message: 'FedEx: Your parcel #IN849120 is held at customs. A customs handling charge of ₹49.00 is unpaid. Update address and pay to prevent return: https://fedex-express-delivery.site/pay',
    correctAction: 'block',
    explanation: 'Scammers use tiny fees (₹49 or $1.99) so victims think it is harmless to pay, but the fake payment portal steals their full debit/credit card numbers and CVV.',
    indicators: ['Suspicious domain (.site instead of fedex.com)', 'Unsolicited international parcel notice', 'Payment demand via SMS link'],
  },
  {
    id: 5,
    sender: 'HR_Pooja_Amazon',
    avatar: 'briefcase-outline',
    type: 'Job Scam / Task Fraud',
    message: 'Greetings! Amazon is hiring part-time product reviewers. Work 30-40 mins daily from home and earn ₹3,500 - ₹8,000/day. No qualification required. Join our official Telegram group to claim ₹500 welcome bonus: t.me/amazon_careers_fast',
    correctAction: 'block',
    explanation: 'Legitimate companies never recruit for ₹8,000/day jobs via Telegram or offer welcome bonuses. This is the classic "Task Scam" that lures victims into paying deposits.',
    indicators: ['Unrealistic salary for zero qualification', 'Telegram group link', 'Unsolicited recruitment message'],
  },
];

export default function ArenaScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const current = SCENARIOS[currentIndex];

  const handleAction = (action: 'block' | 'verify' | 'click') => {
    setSelectedAction(action);
    setShowResult(true);
    if (action === current.correctAction) {
      setScore(s => s + 20);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < SCENARIOS.length) {
      setCurrentIndex(i => i + 1);
      setSelectedAction(null);
      setShowResult(false);
    } else {
      setGameFinished(true);
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAction(null);
    setShowResult(false);
    setGameFinished(false);
  };

  const getRank = () => {
    if (score >= 90) return { title: 'Cyber Sentinel 🛡️', desc: 'Expert Level! You can spot even subtle social engineering tactics.' };
    if (score >= 60) return { title: 'Vigilant Guardian 👁️', desc: 'Good awareness! Keep double-checking sender domains and links.' };
    return { title: 'Scam Target Alert ⚠️', desc: 'Be careful! Scammers could trick you with urgency or lookalike links.' };
  };

  if (gameFinished) {
    const rank = getRank();
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Training Complete" />
        <View style={styles.finishContainer}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={54} color={Colors.caution} />
          </View>
          <Text style={styles.finishScore}>{score} / 100</Text>
          <Text style={styles.finishRank}>{rank.title}</Text>
          <Text style={styles.finishDesc}>{rank.desc}</Text>

          <TouchableOpacity style={styles.retryBtn} onPress={restartGame}>
            <Ionicons name="refresh" size={18} color={Colors.white} />
            <Text style={styles.retryBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCorrect = selectedAction === current.correctAction;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Threat Arena" subtitle={`Scenario ${currentIndex + 1} of ${SCENARIOS.length} · Score: ${score}`} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / SCENARIOS.length) * 100}%` }]} />
        </View>

        {/* Message Simulator Box */}
        <View style={styles.phoneFrame}>
          <View style={styles.phoneHeader}>
            <View style={styles.senderAvatar}>
              <Ionicons name={current.avatar as any} size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.senderName}>{current.sender}</Text>
              <Text style={styles.threatTypeTag}>{current.type}</Text>
            </View>
          </View>

          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{current.message}</Text>
            <Text style={styles.messageTime}>Today, 10:42 AM</Text>
          </View>
        </View>

        <Text style={styles.decisionPrompt}>What should you do with this message?</Text>

        {/* Action Choices */}
        <View style={styles.choicesGrid}>
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              selectedAction === 'block' && (current.correctAction === 'block' ? styles.choiceCorrect : styles.choiceWrong),
            ]}
            onPress={() => !showResult && handleAction('block')}
            disabled={showResult}
          >
            <Ionicons name="shield-outline" size={20} color={Colors.safe} />
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>Report & Block</Text>
              <Text style={styles.choiceDesc}>Do not click links or reply</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceBtn,
              selectedAction === 'verify' && (current.correctAction === 'verify' ? styles.choiceCorrect : styles.choiceWrong),
            ]}
            onPress={() => !showResult && handleAction('verify')}
            disabled={showResult}
          >
            <Ionicons name="call-outline" size={20} color={Colors.caution} />
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>Verify Independently</Text>
              <Text style={styles.choiceDesc}>Check official app / number</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceBtn,
              selectedAction === 'click' && (current.correctAction === 'click' ? styles.choiceCorrect : styles.choiceWrong),
            ]}
            onPress={() => !showResult && handleAction('click')}
            disabled={showResult}
          >
            <Ionicons name="arrow-forward-outline" size={20} color={Colors.highRisk} />
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>Click Link / Comply</Text>
              <Text style={styles.choiceDesc}>Follow instructions immediately</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Feedback Reveal */}
        {showResult && (
          <View style={[styles.feedbackCard, { borderColor: isCorrect ? Colors.safe : Colors.highRisk }]}>
            <View style={styles.feedbackTitleRow}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={isCorrect ? Colors.safe : Colors.highRisk}
              />
              <Text style={[styles.feedbackTitle, { color: isCorrect ? Colors.safe : Colors.highRisk }]}>
                {isCorrect ? 'Correct! +20 Points' : 'Dangerous Move!'}
              </Text>
            </View>
            <Text style={styles.explanationText}>{current.explanation}</Text>

            <View style={styles.indicatorsList}>
              <Text style={styles.indicatorsTitle}>Red Flags in this message:</Text>
              {current.indicators.map((ind, i) => (
                <View key={i} style={styles.indicatorRow}>
                  <Ionicons name="alert-circle-outline" size={14} color={Colors.caution} />
                  <Text style={styles.indicatorText}>{ind}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex + 1 === SCENARIOS.length ? 'View Final Score' : 'Next Scenario'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
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
  progressBar: { height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2, marginVertical: Spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  phoneFrame: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    ...Shadows.sm,
  },
  phoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  senderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  senderName: { fontSize: Typography.fontSizes.sm, fontWeight: '800', color: Colors.textPrimary },
  threatTypeTag: { fontSize: 10, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  messageBubble: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder },
  messageText: { fontSize: Typography.fontSizes.sm, color: Colors.textPrimary, lineHeight: 22 },
  messageTime: { fontSize: 10, color: Colors.textMuted, marginTop: 8, textAlign: 'right' },
  decisionPrompt: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  choicesGrid: { gap: 10 },
  choiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  choiceCorrect: { borderColor: Colors.safe, backgroundColor: Colors.safe + '15' },
  choiceWrong: { borderColor: Colors.highRisk, backgroundColor: Colors.highRisk + '15' },
  choiceTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  choiceDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  feedbackCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.base, borderWidth: 2, marginTop: Spacing.lg,
    ...Shadows.md,
  },
  feedbackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  feedbackTitle: { fontSize: Typography.fontSizes.base, fontWeight: '800' },
  explanationText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  indicatorsList: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.md },
  indicatorsTitle: { fontSize: 11, fontWeight: '700', color: Colors.caution, marginBottom: 4 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 },
  indicatorText: { fontSize: 11, color: Colors.textSecondary },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: BorderRadius.lg,
  },
  nextBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.sm },
  finishContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  trophyCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.caution + '22', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.base },
  finishScore: { fontSize: 48, fontWeight: '800', color: Colors.textPrimary },
  finishRank: { fontSize: Typography.fontSizes.xl, fontWeight: '800', color: Colors.primary, marginTop: 4 },
  finishDesc: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22, maxWidth: 300 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: BorderRadius.xl, marginTop: Spacing.xl, ...Shadows.lg,
  },
  retryBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.base },
});

