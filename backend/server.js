const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const borrowingRoutes = require('./routes/borrowings');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DUC-Library API', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server & Initialize DB
initDb().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 DUC-Library Backend Server is running on port ${PORT}`);
    console.log(`👉 API Base URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️  Port ${PORT} is already in use by an active backend process.`);
      console.error(`👉 The backend is ALREADY running on http://localhost:${PORT}/api !`);
      console.error(`   (You do not need to start it again, or close existing node window to restart)\n`);
    } else {
      console.error('Server error:', err);
    }
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
