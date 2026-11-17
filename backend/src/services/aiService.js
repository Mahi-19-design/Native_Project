/**
 * AI Service — replaceable provider module.
 * Supports: openai, gemini.
 * Falls back gracefully if key is missing.
 */

const PROVIDER = process.env.AI_PROVIDER || 'openai';

const SYSTEM_PROMPT = `You are ScamLens, an AI scam detection assistant. Analyse the given message for signs of fraud, phishing, social engineering, or scams.

Return ONLY valid JSON with this exact structure:
{
  "riskScore": <integer 0-100>,
  "riskLevel": <"LOW"|"CAUTION"|"HIGH"|"CRITICAL">,
  "category": <string, e.g. "Phishing", "OTP Fraud", "Job Scam", "Legitimate Message">,
  "summary": <string, 1-3 sentences>,
  "indicators": [{"name": <string>, "explanation": <string>}],
  "recommendations": [<string>],
  "urls": [<string>],
  "confidence": <float 0-1>
}

Rules:
- riskScore 0-24 = LOW, 25-49 = CAUTION, 50-74 = HIGH, 75-100 = CRITICAL
- Do NOT classify as HIGH/CRITICAL based on a single keyword alone
- Never claim to be 100% certain — this is an AI assessment
- Do not include operational instructions for conducting fraud
- If the message appears legitimate, say so clearly`;

async function analyzeWithOpenAI(content) {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyse this message:\n\n${content}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0].message.content);
}

async function analyzeWithGemini(content) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `${SYSTEM_PROMPT}\n\nAnalyse this message:\n\n${content}\n\nReturn only the JSON object.`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON from response
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in Gemini response');
  return JSON.parse(match[0]);
}

async function analyzeMessage(content) {
  if (PROVIDER === 'gemini' && process.env.GEMINI_API_KEY) {
    return analyzeWithGemini(content);
  }
  if (process.env.OPENAI_API_KEY) {
    return analyzeWithOpenAI(content);
  }
  throw new Error('No AI provider configured');
}

module.exports = { analyzeMessage };

