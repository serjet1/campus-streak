const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const checkinRoutes = require('./routes/checkin');
const missionRoutes = require('./routes/missions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/mission', missionRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Campus Life API is running',
    port: PORT
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    cors: corsOptions.origin
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎓 Campus Life server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API Base: http://localhost:${PORT}`);
});

module.exports = app;