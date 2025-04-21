const express = require("express");
const app = express();
const port = 3200;
const cors = require('cors');
require("dotenv").config();
const connectDatabase = require('./config/dbConnection');
const urlShortnerRouter = require('./Routes/urlRoutes');
const useragent = require('express-useragent');
app.use(express.json());
app.use(useragent.express());
app.set('trust proxy',1);

connectDatabase();

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
});