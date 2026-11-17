export interface RuleMatch {
  name: string;
  explanation: string;
  score: number;
}

const URGENT_PATTERNS = [/urgent/i,/immediately/i,/right now/i,/act now/i,/limited time/i,/hurry/i,/last chance/i,/within \d+ (hour|minute|day)/i];
const OTP_PATTERNS = [/\botp\b/i,/one.time.pass/i,/verification code/i,/share.*(code|pin|password)/i,/never share.*otp/i];
const PAYMENT_PATTERNS = [/send money/i,/transfer.*(amount|funds|money)/i,/pay.*(now|immediately|urgent)/i,/\b(upi|paytm|gpay|phonepe|neft|imps)\b/i,/account.*blocked/i,/payment.*pending/i];
const PRIZE_PATTERNS = [/you.ve? won/i,/congratulations.*won/i,/lucky winner/i,/claim.*prize/i,/jackpot/i,/lottery/i,/free gift/i,/giveaway/i];
const JOB_SCAM_PATTERNS = [/work from home/i,/earn.*(per day|daily|weekly)/i,/part.?time.*job/i,/easy money/i,/no experience required/i,/data entry.*job/i,/make money online/i];
const URL_PATTERNS = [/bit\.ly|tinyurl|goo\.gl|t\.co|short\.link|ow\.ly|is\.gd/i];
const IMPERSONATION_PATTERNS = [/\b(sbi|hdfc|icici|axis|kotak|rbi|income.?tax|uidai|aadhaar|epfo|gov\.in)\b/i,/kyc.*update/i,/verify.*account/i];
const PHISHING_PATTERNS = [/click.*link/i,/open.*attachment/i,/download.*app/i,/install.*apk/i,/login.*immediately/i,/security.*alert/i];
const THREAT_PATTERNS = [/account.*closed/i,/suspend.*account/i,/legal.*action/i,/fir.*registered/i,/arrest.*warrant/i,/cyber.*crime/i];

function checkPatterns(text: string, patterns: RegExp[], name: string, explanation: string, score: number): RuleMatch | null {
  if (patterns.some(p => p.test(text))) return { name, explanation, score };
  return null;
}

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return [...new Set(text.match(urlRegex) || [])];
}

export function analyzeWithRules(text: string) {
  const indicators: RuleMatch[] = [];
  let totalScore = 0;

  const checks: Array<[RegExp[], string, string, number]> = [
    [URGENT_PATTERNS, 'Urgency Manipulation', 'The message creates artificial urgency to pressure you into acting without thinking.', 20],
    [OTP_PATTERNS, 'OTP/Password Request', 'Legitimate organizations NEVER ask for your OTP, password, or PIN via message.', 35],
    [PAYMENT_PATTERNS, 'Payment Demand', 'The message requests a financial transaction which is a common fraud tactic.', 30],
    [PRIZE_PATTERNS, 'Prize/Lottery Claim', 'Fake prize or lottery claims are used to extract personal information or money.', 35],
    [JOB_SCAM_PATTERNS, 'Job Scam Indicators', 'This message shows signs of a fraudulent job offer designed to steal money or data.', 30],
    [URL_PATTERNS, 'Suspicious URLs', 'The message contains shortened or suspicious URLs that may lead to phishing sites.', 25],
    [IMPERSONATION_PATTERNS, 'Organization Impersonation', 'The sender appears to be impersonating a legitimate bank, government, or company.', 35],
    [PHISHING_PATTERNS, 'Phishing Attempt', 'The message contains classic phishing indicators asking you to click links or download files.', 30],
    [THREAT_PATTERNS, 'Threatening Language', 'Legitimate organizations do not threaten users with legal action or account suspension via SMS.', 25],
  ];

  for (const [patterns, name, explanation, score] of checks) {
    const match = checkPatterns(text, patterns, name, explanation, score);
    if (match) { indicators.push(match); totalScore += score; }
  }

  if (/[₹$]\s*\d[\d,]+/.test(text) && indicators.length > 0) totalScore += 10;
  const capsRatio = (text.match(/[A-Z]/g) || []).length / (text.length || 1);
  if (capsRatio > 0.4 && text.length > 20) {
    indicators.push({ name: 'Unusual Formatting', explanation: 'Excessive capitalization is used in scam messages to create urgency.', score: 10 });
    totalScore += 10;
  }

  const riskScore = Math.min(100, totalScore);
  let riskLevel: 'LOW' | 'CAUTION' | 'HIGH' | 'CRITICAL';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'CAUTION';
  else riskLevel = 'LOW';

  let category = 'Legitimate Message';
  if (indicators.some(i => i.name === 'OTP/Password Request')) category = 'OTP Fraud';
  else if (indicators.some(i => i.name === 'Phishing Attempt')) category = 'Phishing';
  else if (indicators.some(i => i.name === 'Prize/Lottery Claim')) category = 'Lottery Scam';
  else if (indicators.some(i => i.name === 'Job Scam Indicators')) category = 'Job Scam';
  else if (indicators.some(i => i.name === 'Organization Impersonation')) category = 'Impersonation';
  else if (indicators.some(i => i.name === 'Payment Demand')) category = 'Financial Fraud';
  else if (indicators.some(i => i.name === 'Threatening Language')) category = 'Threatening Message';
  else if (riskScore > 0) category = 'Suspicious Message';

  const summary = riskLevel === 'LOW'
    ? 'No significant suspicious indicators detected. This appears to be a normal communication.'
    : riskLevel === 'CAUTION'
    ? 'Some unusual characteristics detected. Verify independently before taking action.'
    : `Multiple concerning indicators detected. This message shows strong signs of ${category}. Do NOT take any action requested.`;

  const recommendations: string[] = [];
  if (riskLevel !== 'LOW') {
    recommendations.push('Do not click any links in this message.');
    recommendations.push('Do not share personal information, OTPs, or passwords.');
    recommendations.push('Verify by calling the official number of the organization (found on their website).');
    if (indicators.some(i => i.name === 'OTP/Password Request')) recommendations.push('Your bank or government will NEVER ask for your OTP via message.');
    if (indicators.some(i => i.name === 'Payment Demand')) recommendations.push('Do not make any payment based on this message alone.');
    recommendations.push('Report this to cybercrime.gov.in if you believe it is fraudulent.');
  } else {
    recommendations.push('This message appears safe, but always verify before clicking unknown links.');
    recommendations.push('Stay vigilant — scammers constantly change their tactics.');
  }

  return {
    riskScore,
    riskLevel,
    category,
    summary,
    indicators: indicators.map(({ name, explanation }) => ({ name, explanation })),
    recommendations,
    urls: extractUrls(text),
    confidence: indicators.length > 0 ? 0.75 : 0.9,
    analysisMethod: 'rule-based' as const,
  };
}

export function analyzeUrl(url: string) {
  const characteristics: string[] = [];
  let score = 0;

  let parsed: URL | null = null;
  try { parsed = new URL(url); } catch {
    return {
      riskScore: 50, riskLevel: 'CAUTION',
      characteristics: ['Invalid or malformed URL'],
      recommendations: ['This does not appear to be a valid URL. Do not use it.'],
      domainInfo: { domain: url, isHttps: false, hasSubdomain: false, isShortened: false, isIPBased: false },
    };
  }

  const domain = parsed.hostname;
  const isHttps = parsed.protocol === 'https:';
  const isShortened = /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|is\.gd|buff\.ly/.test(domain);
  const isIPBased = /^\d{1,3}(\.\d{1,3}){3}$/.test(domain);
  const parts = domain.split('.');
  const hasSubdomain = parts.length > 2 && !['www', 'mail'].includes(parts[0]);

  if (!isHttps) { characteristics.push('Not using HTTPS encryption'); score += 20; }
  if (isShortened) { characteristics.push('Shortened URL — real destination is hidden'); score += 30; }
  if (isIPBased) { characteristics.push('Uses IP address instead of a domain name'); score += 35; }
  if (hasSubdomain) { characteristics.push(`Suspicious subdomain structure: ${parts.slice(0, -2).join('.')}`); score += 15; }

  const lookalikes: Array<[RegExp, string]> = [
    [/paypa1|paypai|pay-pal/i, 'PayPal lookalike domain'],
    [/amaz0n|amazon-/i, 'Amazon lookalike domain'],
    [/sbi-|sbionline/i, 'SBI Bank lookalike domain'],
    [/netbanking-|ibanking-/i, 'Banking site lookalike'],
  ];
  for (const [pattern, label] of lookalikes) {
    if (pattern.test(domain)) { characteristics.push(label); score += 40; }
  }

  if (parsed.pathname.length > 100) { characteristics.push('Unusually long URL path'); score += 10; }
  if (parsed.search.includes('redirect') || parsed.search.includes('url=')) { characteristics.push('Contains redirect parameter'); score += 15; }

  const riskScore = Math.min(100, score);
  const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'CAUTION' : 'LOW';

  const recommendations: string[] = [];
  if (riskLevel !== 'LOW') {
    recommendations.push('Do not visit this URL.');
    recommendations.push('Do not enter any personal information if you have already visited it.');
    if (isShortened) recommendations.push('Use a URL expander service to safely preview the destination first.');
    recommendations.push('Report suspicious URLs to your bank or the relevant authority.');
  } else {
    recommendations.push('The URL appears relatively safe, but verify before entering credentials.');
    recommendations.push('Confirm the domain matches the official organization website.');
  }

  return { riskScore, riskLevel, characteristics, recommendations, domainInfo: { domain, isHttps, hasSubdomain, isShortened, isIPBased } };
}
