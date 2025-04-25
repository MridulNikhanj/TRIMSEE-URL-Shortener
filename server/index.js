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

app.use(express.json());
app.use(useragent.express());
app.set('trust proxy',1);

// Add health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbState = connectDatabase.mongoose?.connection?.readyState;
    if (dbState === 1) {
      res.status(200).json({ status: 'healthy', database: 'connected' });
    } else {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Connect to database
connectDatabase().catch(err => {
  console.error('Failed to connect to database:', err);
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

app.use('/', urlShortnerRouter);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Base URL: ${base}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});