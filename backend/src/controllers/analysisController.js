const { analyzeMessage: aiAnalyze } = require('../services/aiService');
const { analyzeWithRules, extractUrls } = require('../services/ruleEngine');
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');

// POST /api/analyze/message
exports.analyzeMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Message content is required.' });
    }
    if (content.length > 10000) {
      return res.status(400).json({ message: 'Message too long (max 10000 characters).' });
    }

    let result;
    let analysisMethod = 'rule-based';

    try {
      result = await aiAnalyze(content);
      analysisMethod = 'ai';
    } catch (aiErr) {
      console.warn('AI analysis failed, using rule engine:', aiErr.message);
      result = analyzeWithRules(content);
    }

    // Validate result structure
    if (!result || typeof result.riskScore !== 'number') {
      result = analyzeWithRules(content);
    }

    // Optionally save to DB if user is authenticated
    if (req.user) {
      await Report.create({
        userId: req.user.id,
        reportType: 'message',
        category: result.category,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        summary: result.summary,
        indicators: result.indicators || [],
        recommendations: result.recommendations || [],
        urls: result.urls || [],
        confidence: result.confidence || 0.75,
        analysisMethod,
      });
    }

    res.json({ ...result, analysisMethod });
  } catch (err) {
    console.error('analyzeMessage error:', err);
    res.status(500).json({ message: 'Analysis failed. Please try again.' });
  }
};

// POST /api/analyze/url
exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'URL is required.' });
    }

    const characteristics = [];
    let score = 0;

    let parsed;
    try { parsed = new URL(url); } catch {
      return res.json({
        riskScore: 50, riskLevel: 'CAUTION',
        characteristics: ['Invalid or malformed URL'],
        recommendations: ['This does not appear to be a valid URL.'],
        domainInfo: { domain: url, isHttps: false, hasSubdomain: false, isShortened: false, isIPBased: false },
      });
    }

    const domain = parsed.hostname;
    const isHttps = parsed.protocol === 'https:';
    const isShortened = /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|is\.gd|buff\.ly/.test(domain);
    const isIPBased = /^\d{1,3}(\.\d{1,3}){3}$/.test(domain);
    const parts = domain.split('.');
    const hasSubdomain = parts.length > 2 && !['www', 'mail'].includes(parts[0]);

    if (!isHttps) { characteristics.push('Not using HTTPS encryption'); score += 20; }
    if (isShortened) { characteristics.push('Shortened URL — real destination is hidden'); score += 30; }
    if (isIPBased) { characteristics.push('Uses IP address instead of domain name'); score += 35; }
    if (hasSubdomain) { characteristics.push(`Suspicious subdomain structure`); score += 15; }

    const riskScore = Math.min(100, score);
    const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'CAUTION' : 'LOW';

    res.json({
      riskScore, riskLevel, characteristics,
      recommendations: riskLevel !== 'LOW'
        ? ['Do not visit this URL.', 'Do not enter personal information.', 'Report to relevant authorities.']
        : ['Verify the domain matches the official website before entering credentials.'],
      domainInfo: { domain, isHttps, hasSubdomain, isShortened, isIPBased },
    });
  } catch (err) {
    res.status(500).json({ message: 'URL analysis failed.' });
  }
};

// POST /api/analyze/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { reportId, feedbackType, comments } = req.body;
    if (!reportId || !feedbackType) {
      return res.status(400).json({ message: 'reportId and feedbackType are required.' });
    }
    await Feedback.create({
      reportId,
      userId: req.user ? req.user.id : null,
      feedbackType,
      comments: comments?.slice(0, 500),
    });
    res.json({ message: 'Feedback submitted. Thank you.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit feedback.' });
  }
};

