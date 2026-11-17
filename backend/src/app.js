require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests. Please try again later.' },
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { message: 'Analysis rate limit exceeded. Please wait a moment.' },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://10.0.2.2:8081', '*'],
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analysisLimiter, analysisRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ScamLens API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal error occurred.'
    : err.message;
  console.error(`[ERROR] ${err.stack}`);
  res.status(status).json({ message });
});

module.exports = app;

