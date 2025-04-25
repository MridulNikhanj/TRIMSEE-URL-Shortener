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

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(useragent.express());
app.set('trust proxy',1);

// Add health check endpoint with enhanced logging
app.get('/health', async (req, res) => {
  console.log('[Health Check] Checking application health...');
  try {
    // Check MongoDB connection
    const dbState = connectDatabase.mongoose?.connection?.readyState;
    console.log(`[Health Check] Database state: ${dbState}`);
    
    if (dbState === 1) {
      console.log('[Health Check] Status: healthy');
      res.status(200).json({ 
        status: 'healthy', 
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[Health Check] Status: unhealthy - Database disconnected');
      res.status(503).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        dbState: dbState,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Health Check] Error:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Connect to database with enhanced logging
console.log('[Startup] Initializing database connection...');
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
  console.error('[Error]', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.use('/', urlShortnerRouter);

app.listen(port, () => {
  console.log(`[Startup] App listening on port ${port}`);
  console.log(`[Startup] Base URL: ${base}`);
  console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Startup] MongoDB URI: ${process.env.DB_URI ? '(configured)' : '(missing)'}`);
});