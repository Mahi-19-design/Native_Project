/**
 * Rule-based detection engine (backend mirror of mobile engine).
 * Used as fallback when AI is unavailable.
 */

const PATTERNS = {
  urgent: [/urgent/i, /immediately/i, /right now/i, /act now/i, /limited time/i, /hurry/i, /last chance/i, /within \d+ (hour|minute|day)/i],
  otp: [/\botp\b/i, /one.time.pass/i, /verification code/i, /share.*(code|pin|password)/i],
  payment: [/send money/i, /transfer.*(amount|funds|money)/i, /pay.*(now|immediately|urgent)/i, /\b(upi|paytm|gpay|phonepe|neft|imps)\b/i, /account.*blocked/i],
  prize: [/you.ve? won/i, /congratulations.*won/i, /lucky winner/i, /claim.*prize/i, /jackpot/i, /lottery/i, /free gift/i],
  job: [/work from home/i, /earn.*(per day|daily|weekly)/i, /part.?time.*job/i, /easy money/i, /no experience required/i, /data entry.*job/i],
  url: [/bit\.ly|tinyurl|goo\.gl|t\.co|short\.link|ow\.ly|is\.gd/i],
  impersonation: [/\b(sbi|hdfc|icici|axis|kotak|rbi|income.?tax|uidai|aadhaar|epfo|gov\.in)\b/i, /kyc.*update/i, /verify.*account/i],
  phishing: [/click.*link/i, /download.*app/i, /install.*apk/i, /login.*immediately/i, /security.*alert/i],
  threat: [/account.*closed/i, /suspend.*account/i, /legal.*action/i, /fir.*registered/i, /arrest.*warrant/i],
};

const RULE_DEFINITIONS = [
  { key: 'otp', name: 'OTP/Password Request', explanation: 'Legitimate organizations NEVER ask for your OTP via message.', score: 35 },
  { key: 'impersonation', name: 'Organization Impersonation', explanation: 'Appears to impersonate a legitimate bank, government body, or company.', score: 35 },
  { key: 'prize', name: 'Prize/Lottery Claim', explanation: 'Fake prize claims are used to extract personal information or money.', score: 35 },
  { key: 'payment', name: 'Payment Demand', explanation: 'Requests a financial transaction — a common fraud tactic.', score: 30 },
  { key: 'job', name: 'Job Scam Indicators', explanation: 'Shows signs of a fraudulent job offer.', score: 30 },
  { key: 'phishing', name: 'Phishing Attempt', explanation: 'Contains phishing indicators such as asking you to click links or download files.', score: 30 },
  { key: 'urgent', name: 'Urgency Manipulation', explanation: 'Creates artificial urgency to pressure action without thinking.', score: 20 },
  { key: 'url', name: 'Suspicious URLs', explanation: 'Contains shortened or suspicious URLs that may lead to phishing sites.', score: 25 },
  { key: 'threat', name: 'Threatening Language', explanation: 'Uses legal threats or account suspension threats.', score: 25 },
];

function extractUrls(text) {
  return [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi) || []))];
}

function analyzeWithRules(text) {
  const indicators = [];
  let totalScore = 0;

  for (const rule of RULE_DEFINITIONS) {
    if (PATTERNS[rule.key].some((p) => p.test(text))) {
      indicators.push({ name: rule.name, explanation: rule.explanation });
      totalScore += rule.score;
    }
  }

  const riskScore = Math.min(100, totalScore);
  const riskLevel =
    riskScore >= 75 ? 'CRITICAL' :
    riskScore >= 50 ? 'HIGH' :
    riskScore >= 25 ? 'CAUTION' : 'LOW';

  let category = 'Legitimate Message';
  const names = indicators.map((i) => i.name);
  if (names.includes('OTP/Password Request')) category = 'OTP Fraud';
  else if (names.includes('Phishing Attempt')) category = 'Phishing';
  else if (names.includes('Prize/Lottery Claim')) category = 'Lottery Scam';
  else if (names.includes('Job Scam Indicators')) category = 'Job Scam';
  else if (names.includes('Organization Impersonation')) category = 'Impersonation';
  else if (names.includes('Payment Demand')) category = 'Financial Fraud';
  else if (names.includes('Threatening Language')) category = 'Threatening Message';
  else if (riskScore > 0) category = 'Suspicious Message';

  const summary =
    riskLevel === 'LOW'
      ? 'No significant suspicious indicators detected. This appears to be a normal communication.'
      : `Multiple concerning indicators detected. This message shows signs of ${category}.`;

  const recommendations = riskLevel !== 'LOW' ? [
    'Do not click any links in this message.',
    'Do not share personal information, OTPs, or passwords.',
    'Verify by calling the official number of the organization.',
    'Report to cybercrime.gov.in if you believe it is fraudulent.',
  ] : [
    'This message appears safe, but always verify before clicking unknown links.',
  ];

  return {
    riskScore, riskLevel, category, summary, indicators, recommendations,
    urls: extractUrls(text), confidence: 0.75, analysisMethod: 'rule-based',
  };
}

module.exports = { analyzeWithRules, extractUrls };

