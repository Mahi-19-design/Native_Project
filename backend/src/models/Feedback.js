const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  reportId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  feedbackType: { type: String, enum: ['correct', 'incorrect', 'unsure'], required: true },
  comments: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);

