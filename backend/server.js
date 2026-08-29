const express = require('express');
const cors = require('cors');
const path = require('path');
const ORM = require('./googleSheetsORM');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const borrowingRoutes = require('./routes/borrowings');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const checkinRoutes = require('./routes/checkins');

const app = express();
app.set('trust proxy', true); // Trust reverse proxy headers (crucial for getting IP on Render/Heroku)
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

app.get('/', (req, res) => {
  res.send('Server is running...!');
})

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/wishlists', require('./routes/wishlists'));
app.use('/api/settings', require('./routes/settings'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DUC-Library API (Google Sheets DB)', timestamp: new Date() });
});

// SSE Endpoint
const sse = require('./services/sse');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');

app.get('/api/events/stream', (req, res) => {
  const token = req.query.token;
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  if (token && token !== 'null' && token !== 'undefined') {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        sse.addClient(`anon-${Date.now()}-${Math.random()}`, res, null);
      } else {
        sse.addClient(user.id, res, user);
      }
    });
  } else {
    sse.addClient(`anon-${Date.now()}-${Math.random()}`, res, null);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Initialize Google Sheets and start server
async function startServer() {
  try {
    await ORM.initializeSheets();
    console.log('[GoogleSheetsORM] Initialized successfully');
    
    // Wire up push notifications
    const pushService = require('./services/pushService');
    ORM.events.on('notification_inserted', (notif) => {
      pushService.sendPushNotification(notif.user_id, {
        title: notif.title,
        body: notif.message,
        url: '/' // URL to open when clicked
      });
    });
    
    // Start Server
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 DUC-Library Backend Server is running on port ${PORT}`);
      console.log(`👉 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔥 Database: Google Sheets`);
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

  } catch (err) {
    console.error('[GoogleSheetsORM] Initialization error:', err.message);
    process.exit(1);
  }
}

startServer();
