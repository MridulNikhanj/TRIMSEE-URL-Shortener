const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
const connectDatabase = require('./config/dbConnection');
const urlShortnerRouter = require('./Routes/urlRoutes');
const useragent = require('express-useragent');
const rateLimit = require('express-rate-limit');

// Enable detailed logging
const debug = require('debug')('app:server');

// Generate unique request ID
const requestId = () => Math.random().toString(36).substring(7);

// Enhanced logging middleware with request ID
app.use((req, res, next) => {
  req.id = requestId();
  console.log(`[${new Date().toISOString()}][${req.id}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(useragent.express());
app.set('trust proxy',1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Memory monitoring
const monitorMemory = () => {
  const used = process.memoryUsage();
  const memoryUsage = {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  };
  console.log('Memory Usage:', memoryUsage);
  
  // Trigger garbage collection if heap usage is above 70%
  if (used.heapUsed / used.heapTotal > 0.7 && global.gc) {
    console.log('Triggering garbage collection...');
    global.gc();
  }
};

// Monitor memory every 5 minutes
setInterval(monitorMemory, 5 * 60 * 1000);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const mongoose = connectDatabase.mongoose;
        const dbState = mongoose.connection.readyState;
        const memoryUsage = process.memoryUsage();
        const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal * 100).toFixed(2);
        
        console.log(`[${new Date().toISOString()}][${req.id}] Health check - DB State: ${dbState}`);
        
        const dbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const health = {
            status: dbState === 1 ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: dbStatus[dbState] || 'unknown',
            uptime: process.uptime(),
            memory: {
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsagePercent: `${heapUsagePercent}%`
            },
            requestId: req.id
        };

        console.log(`[${new Date().toISOString()}][${req.id}] Health check response:`, health);
        
        res.status(dbState === 1 ? 200 : 503).json(health);
    } catch (error) {
        console.error(`[${new Date().toISOString()}][${req.id}] Health check error:`, error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            requestId: req.id
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
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}][${req.id}] Error:`, err);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error',
    requestId: req.id
  });
});

app.use('/', urlShortnerRouter);

const server = app.listen(process.env.PORT || 3200, () => {
  console.log(`[Startup] App listening on port ${process.env.PORT || 3200}`);
  console.log(`[Startup] Base URL: ${process.env.BASE || 'http://localhost:3200'}`);
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