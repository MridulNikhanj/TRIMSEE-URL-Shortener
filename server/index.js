const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const port = process.env.PORT || 3200;
const base = process.env.BASE || 'http://localhost:3200';
const connectDatabase = require('./config/dbConnection');
const urlShortnerRouter = require('./Routes/urlRoutes');
const useragent = require('express-useragent');

// Enhanced logging middleware with request ID
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(7);
  console.log(`[${new Date().toISOString()}][${req.requestId}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(useragent.express());
app.set('trust proxy',1);

// Add health check endpoint with enhanced logging
app.get('/health', async (req, res) => {
  const requestId = req.requestId;
  console.log(`[${new Date().toISOString()}][${requestId}] Health Check: Starting health check...`);
  try {
    // Check MongoDB connection
    const dbState = connectDatabase.mongoose?.connection?.readyState;
    console.log(`[${new Date().toISOString()}][${requestId}] Health Check: Database state: ${dbState}`);
    console.log(`[${new Date().toISOString()}][${requestId}] Health Check: DB_URI configured: ${!!process.env.DB_URI}`);
    
    if (dbState === 1) {
      console.log(`[${new Date().toISOString()}][${requestId}] Health Check: Status: healthy`);
      res.status(200).json({ 
        status: 'healthy', 
        database: 'connected',
        timestamp: new Date().toISOString(),
        requestId: requestId
      });
    } else {
      console.log(`[${new Date().toISOString()}][${requestId}] Health Check: Status: unhealthy - Database disconnected`);
      res.status(503).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        dbState: dbState,
        timestamp: new Date().toISOString(),
        requestId: requestId
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}][${requestId}] Health Check Error:`, error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString(),
      requestId: requestId
    });
  }
});

// Connect to database with enhanced logging
console.log('[Startup] Initializing database connection...');
console.log('[Startup] DB_URI:', process.env.DB_URI ? '(configured)' : '(missing)');
console.log('[Startup] Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  BASE: process.env.BASE,
  PORT: process.env.PORT
});

connectDatabase().catch(err => {
  console.error('[Startup] Failed to connect to database:', err);
  process.exit(1);
});

// More detailed CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// Error handling middleware
app.use((err, req, res, next) => {
  const requestId = req.requestId;
  console.error(`[${new Date().toISOString()}][${requestId}] Error:`, err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
    requestId: requestId
  });
});

app.use('/', urlShortnerRouter);

const server = app.listen(port, () => {
  console.log(`[Startup] App listening on port ${port}`);
  console.log(`[Startup] Base URL: ${base}`);
  console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Startup] MongoDB URI: ${process.env.DB_URI ? '(configured)' : '(missing)'}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('[Server Error]', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
  process.exit(1);
});