import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface ScamCategory {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  howItWorks: string;
  warningSigns: string[];
  protection: string[];
  ifTargeted: string[];
}

const CATEGORIES: ScamCategory[] = [
  {
    id: 'banking',
    title: 'Banking Fraud',
    icon: 'card-outline',
    color: '#EF4444',
    description: 'Fraudsters impersonate bank officials to steal credentials and authorize unauthorized transactions.',
    howItWorks: 'Criminals pose as bank employees claiming your account is compromised. They create urgency and ask for card details, net-banking credentials, or OTP to "verify" or "secure" your account.',
    warningSigns: [
      'Bank calling to ask for your OTP or PIN',
      'Urgent request to update KYC via an SMS link',
      'Threat of account suspension or block',
      'Request to install a "bank security" application',
      'Caller ID showing bank number (can be spoofed)',
    ],
    protection: [
      'Never share OTP, PIN, or password with anyone',
      'Your bank already has your KYC — no genuine update requires a link in an SMS',
      'Call your bank directly using the official number on their website',
      'Enable transaction alerts and two-factor authentication',
    ],
    ifTargeted: [
      'Call your bank immediately to freeze your account',
      'Report to cybercrime.gov.in or call 1930',
      'File a complaint at your nearest police station',
      'Document all messages and call records',
    ],
  },
  {
    id: 'upi',
    title: 'UPI Scams',
    icon: 'phone-portrait-outline',
    color: '#8B5CF6',
    description: 'Fraudsters exploit UPI payment systems to trick users into paying money or revealing credentials.',
    howItWorks: 'Tactics include sending a "collect" request disguised as a refund, sharing a QR code that deducts money when scanned, or fake customer support asking for your UPI PIN.',
    warningSigns: [
      'Someone asks you to scan a QR code to "receive" money',
      'UPI collect request from an unknown number',
      'Request for your UPI PIN (never needed to receive money)',
      '"Refund" that requires you to enter your PIN',
      'Fake payment screenshots as proof of transfer',
    ],
    protection: [
      'You never need to enter a PIN to receive money — only to send it',
      'Never share your UPI PIN with anyone',
      'Verify collect requests before approving them',
      'Use only official bank apps or NPCI-approved UPI applications',
    ],
    ifTargeted: [
      'Report to your UPI app provider immediately',
      'Contact your bank to block your UPI account',
      'Report to cybercrime.gov.in',
      'Call the National Cyber Crime helpline: 1930',
    ],
  },
  {
    id: 'jobs',
    title: 'Fake Job Offers',
    icon: 'briefcase-outline',
    color: '#F59E0B',
    description: 'Fraudulent employment opportunities designed to steal money or personal information from job seekers.',
    howItWorks: 'Fraudsters post attractive job ads on social media or message people directly promising high salaries for minimal work, then ask for a registration fee, security deposit, or training materials before you start.',
    warningSigns: [
      'High pay promised for minimal skills or experience',
      'Requests for payment before you can start',
      'WhatsApp or Telegram-only recruitment process',
      'Vague company name with no verifiable address',
      'No formal interview process',
    ],
    protection: [
      'Legitimate employers never ask you to pay to get hired',
      'Verify the company on LinkedIn, MCA, or official government databases',
      'Avoid jobs shared via unsolicited WhatsApp or SMS messages',
      'Research salary ranges — if it sounds too good, it usually is',
    ],
    ifTargeted: [
      'Stop all communication immediately',
      'Do not send any additional payments',
      'Report to cybercrime.gov.in',
      'Report the job advertisement on the platform where you found it',
    ],
  },
  {
    id: 'phishing',
    title: 'Phishing',
    icon: 'fish-outline',
    color: '#3B7FFF',
    description: 'Deceptive links and fake websites designed to steal your login credentials or personal information.',
    howItWorks: 'You receive a message with a link leading to a fake website mimicking your bank, e-commerce site, or government portal. The site captures your credentials when you enter them.',
    warningSigns: [
      'Misspelled domain name (e.g. "amaz0n.com" or "sbi-bank.com")',
      'HTTP instead of HTTPS in the browser address bar',
      'Urgent login request received via SMS or email',
      'Unexpected password reset email you did not request',
      'Generic greeting such as "Dear Customer"',
    ],
    protection: [
      'Always type URLs directly into your browser rather than clicking links',
      'Check the URL bar carefully before entering any credentials',
      'Look for the padlock icon and correct domain spelling',
      'Use a password manager — it will not auto-fill on a fake site',
      'Enable two-factor authentication on all accounts',
    ],
    ifTargeted: [
      'Change your password immediately on the real website',
      'Enable 2FA if not already active',
      'Monitor your account for unauthorised activity',
      'Report the phishing site to Google Safe Browsing or CERT-In',
    ],
  },
  {
    id: 'otp',
    title: 'OTP Fraud',
    icon: 'keypad-outline',
    color: '#EF4444',
    description: 'Criminals use social engineering to convince you to share your OTP, granting them access to your accounts.',
    howItWorks: 'A fraudster calls claiming to be from your bank, telecom provider, or government. They say there is an urgent issue and need you to share the OTP you just received "to verify your identity" or "to process a refund".',
    warningSigns: [
      'Any call or message asking for an OTP',
      'Claim that sharing an OTP is needed to receive money',
      'Urgency around sharing a code you just received',
      'Caller says the OTP "confirms a cancellation or refund"',
    ],
    protection: [
      'NO legitimate organization will EVER ask for your OTP',
      'Hang up immediately if someone asks for an OTP',
      'An OTP is a one-time transaction authorization — guard it like your PIN',
      'If you shared an OTP, call your bank immediately to block your account',
    ],
    ifTargeted: [
      'Call your bank immediately to report unauthorized access',
      'Change all your passwords right away',
      'Report to cybercrime.gov.in',
      'Block all cards and accounts if any transaction occurred',
    ],
  },
  {
    id: 'investment',
    title: 'Investment Scams',
    icon: 'trending-up-outline',
    color: '#10B981',
    description: 'Fraudulent investment schemes promising guaranteed high returns, often in cryptocurrency or trading.',
    howItWorks: 'Victims are lured into fake investment apps or platforms with promises of 2–5% daily returns. Small early withdrawals are allowed to build trust. Eventually the platform disappears with all deposited funds.',
    warningSigns: [
      'Guaranteed returns (no legitimate investment can guarantee this)',
      'Request to join a private WhatsApp or Telegram investment group',
      'Celebrity endorsements or fake testimonials',
      'Urgency to invest immediately before an opportunity expires',
      'Withdrawal requires paying a "tax" or "fee" first',
    ],
    protection: [
      'No legitimate investment guarantees fixed returns',
      'Check SEBI registration for all investment advisors at sebi.gov.in',
      'Avoid unregistered platforms or mobile apps',
      'Never invest in schemes promoted via WhatsApp or Telegram groups',
    ],
    ifTargeted: [
      'Stop all deposits immediately',
      'Document all communications and transactions',
      'Report to SEBI at sebi.gov.in and cybercrime.gov.in',
      'File an FIR at your local police station',
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery Scams',
    icon: 'cube-outline',
    color: '#06B6D4',
    description: 'Fake delivery notifications used to phish for personal information or payment.',
    howItWorks: 'You receive an SMS or email claiming your package could not be delivered and asking you to "update your address" or "pay a small customs fee" via a link leading to a phishing or payment-theft site.',
    warningSigns: [
      'Unexpected package notification you did not order',
      'Request for payment to release a parcel',
      'Link pointing to an unofficial courier website',
      '"Final delivery attempt" warning creating urgency',
      'Customs fee demand for an unexpected international package',
    ],
    protection: [
      'Track packages only on the official courier app or website',
      'Legitimate couriers rarely collect fees via SMS links',
      'Verify tracking numbers only on official courier sites',
      'Never enter payment information on sites you reached via an SMS link',
    ],
    ifTargeted: [
      'Do not complete the payment if you have not already done so',
      'Report to the genuine courier company',
      'Report to cybercrime.gov.in if payment was made',
    ],
  },
  {
    id: 'government',
    title: 'Government Impersonation',
    icon: 'business-outline',
    color: '#F97316',
    description: 'Fraudsters pose as government officials from Income Tax, TRAI, police, or other agencies.',
    howItWorks: 'Victims receive threatening calls or messages claiming outstanding taxes, an illegal parcel in their name, or a court summons. They are told to pay a fine immediately or face arrest.',
    warningSigns: [
      'Threat of arrest, FIR, or legal action via phone or SMS',
      'Demand for immediate payment to avoid a penalty',
      '"Digital arrest" claim (this is not a real legal concept)',
      'Request for personal ID or bank details',
      'WhatsApp video call claiming to be from police or CBI',
    ],
    protection: [
      'Government agencies do not contact you via WhatsApp for legal matters',
      '"Digital arrest" does not exist in Indian law — it is always a scam',
      'If you owe taxes or have a legal issue you receive official notices by post',
      'Hang up and verify through official government portals',
    ],
    ifTargeted: [
      'Do not make any payment',
      'Note down the caller\'s details and call times',
      'Report to your local police station',
      'Report to cybercrime.gov.in and call 1930',
    ],
  },
  {
    id: 'qr',
    title: 'QR Code Fraud',
    icon: 'qr-code-outline',
    color: '#8B5CF6',
    description: 'Malicious QR codes that redirect to phishing sites or initiate unauthorized payments.',
    howItWorks: 'Fraudsters share QR codes via social media, paper flyers, or messaging apps claiming they represent a payment or prize. Scanning initiates an unauthorized payment or redirects to a credential-stealing site.',
    warningSigns: [
      'QR code sent for "receiving" a payment (scanning should not be needed)',
      'QR code at a public place that appears stuck over another label',
      'QR code from an unknown contact promising a reward',
      'QR code that requests app permissions after scanning',
    ],
    protection: [
      'Always use ScamLens or a trusted QR scanner that previews URLs before opening',
      'Do not scan QR codes from unknown or unverified sources',
      'You do not need to scan a QR code to receive money',
      'Inspect QR codes from physical merchants before scanning',
    ],
    ifTargeted: [
      'Report the transaction to your bank immediately',
      'Report to cybercrime.gov.in',
      'File a police complaint if a significant amount was lost',
    ],
  },
  {
    id: 'social',
    title: 'Social Media Scams',
    icon: 'people-outline',
    color: '#EC4899',
    description: 'Scams conducted through social media platforms including fake profiles, lotteries, and romance fraud.',
    howItWorks: 'Common types include fake celebrity giveaways, romance scams (building emotional relationships before asking for money), account hacking via fake login pages, and fraudulent charity campaigns.',
    warningSigns: [
      'Celebrity account with few followers asking you for money via DM',
      'New contact you met online asking for financial help',
      'Unexpected prize notification from a social media page',
      'Request to verify your account via a suspicious link',
      'Too-good-to-be-true product deals from unverified pages',
    ],
    protection: [
      'Legitimate celebrities or companies never ask followers for money via direct message',
      'Verify accounts via the blue verification tick on official platforms',
      'Never send money to someone you have only met online',
      'Report fake accounts to the platform immediately',
    ],
    ifTargeted: [
      'Stop all communication immediately',
      'Report the account to the social media platform',
      'Report to cybercrime.gov.in',
      'If financially defrauded, file an FIR at your local police station',
    ],
  },
];

function Section({
  title, icon, color, children,
}: { title: string; icon: keyof typeof Ionicons.glyphMap; color: string; children: React.ReactNode }) {
  return (
    <View style={sStyles.container}>
      <View style={sStyles.header}>
        <Ionicons name={icon} size={15} color={color} />
        <Text style={[sStyles.title, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Bullet({ text, color }: { text: string; color: string }) {
  return (
    <View style={bStyles.row}>
      <View style={[bStyles.dot, { backgroundColor: color }]} />
      <Text style={bStyles.text}>{text}</Text>
    </View>
  );
}

export default function LearnScreen() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="book" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Scam Education</Text>
        </View>
        <Text style={styles.subtitle}>
          Learn to recognise and protect yourself from common digital fraud.
        </Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scam types..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        {filtered.map((cat) => (
          <View key={cat.id} style={styles.catCard}>
            <TouchableOpacity
              style={styles.catHeader}
              onPress={() => setExpanded((e) => (e === cat.id ? null : cat.id))}
              activeOpacity={0.8}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                <Ionicons name={cat.icon} size={22} color={cat.color} />
              </View>
              <View style={styles.catTitleWrap}>
                <Text style={styles.catTitle}>{cat.title}</Text>
                <Text style={styles.catDesc} numberOfLines={expanded === cat.id ? undefined : 2}>
                  {cat.description}
                </Text>
              </View>
              <Ionicons
                name={expanded === cat.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {expanded === cat.id && (
              <View style={styles.catContent}>
                <Section title="How It Works" icon="information-circle-outline" color={Colors.primary}>
                  <Text style={styles.bodyText}>{cat.howItWorks}</Text>
                </Section>
                <Section title="Warning Signs" icon="warning-outline" color={Colors.caution}>
                  {cat.warningSigns.map((s, i) => <Bullet key={i} text={s} color={Colors.caution} />)}
                </Section>
                <Section title="How to Protect Yourself" icon="shield-checkmark-outline" color={Colors.safe}>
                  {cat.protection.map((s, i) => <Bullet key={i} text={s} color={Colors.safe} />)}
                </Section>
                <Section title="If You Are Targeted" icon="call-outline" color={Colors.highRisk}>
                  {cat.ifTargeted.map((s, i) => <Bullet key={i} text={s} color={Colors.highRisk} />)}
                </Section>
              </View>
            )}
          </View>
        ))}

        {/* Report Banner */}
        <View style={styles.reportBanner}>
          <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.reportBannerTitle}>Report Cyber Crime in India</Text>
            <Text style={styles.reportBannerText}>
              Call 1930 or visit cybercrime.gov.in to report online fraud.
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const sStyles = StyleSheet.create({
  container: { marginBottom: Spacing.base },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  title: { fontSize: Typography.fontSizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});

const bStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  text: { flex: 1, fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: Spacing.lg },
  headerTitle: { fontSize: Typography.fontSizes['2xl'], fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary, marginBottom: Spacing.base, lineHeight: 22 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  catCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md, overflow: 'hidden',
  },
  catHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: 12 },
  catIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  catTitleWrap: { flex: 1 },
  catTitle: { fontSize: Typography.fontSizes.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  catDesc: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 17 },
  catContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: Spacing.base,
  },
  bodyText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  reportBanner: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.primary + '11',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.primary + '33',
    marginTop: Spacing.md,
  },
  reportBannerTitle: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  reportBannerText: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary },
});

