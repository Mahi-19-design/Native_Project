const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reportType: { type: String, enum: ['message', 'url', 'qr'], required: true },
  category: { type: String, required: true },
  riskScore: { type: Number, min: 0, max: 100, required: true },
  riskLevel: { type: String, enum: ['LOW', 'CAUTION', 'HIGH', 'CRITICAL'], required: true },
  summary: { type: String, required: true },
  indicators: [{
    name: String,
    explanation: String,
  }],
  recommendations: [String],
  urls: [String],
  confidence: { type: Number, min: 0, max: 1 },
  analysisMethod: { type: String, enum: ['ai', 'rule-based'], default: 'rule-based' },
  saved: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
});

reportSchema.index({ userId: 1, submittedAt: -1 });
reportSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Report', reportSchema);

