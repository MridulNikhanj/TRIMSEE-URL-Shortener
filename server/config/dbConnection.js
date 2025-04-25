const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

// Function to log with file and line information
const logWithContext = (message, error = null) => {
    const stack = error ? error.stack : new Error().stack;
    const caller = stack.split('\n')[2];
    const match = caller.match(/\((.+):(\d+):\d+\)$/);
    const file = match ? match[1].split('/').pop() : 'unknown';
    const line = match ? match[2] : 'unknown';
    console.log(`[${new Date().toISOString()}][${file}:${line}] ${message}`);
    if (error) {
        console.error(`[${new Date().toISOString()}][${file}:${line}] Error details:`, error);
    }
};

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    w: "majority"
};

const validateMongoURI = (uri) => {
    if (!uri) {
        throw new Error('DB_URI environment variable is not defined');
    }
    
    try {
        const url = new URL(uri);
        if (url.protocol !== 'mongodb+srv:' && url.protocol !== 'mongodb:') {
            throw new Error('Invalid MongoDB protocol');
        }
        if (!url.username || !url.password) {
            throw new Error('MongoDB URI missing credentials');
        }
        if (!url.hostname) {
            throw new Error('MongoDB URI missing hostname');
        }
    } catch (error) {
        throw new Error(`Invalid MongoDB URI: ${error.message}`);
    }
};

const connectWithRetry = async (retries = 5, delay = 5000) => {
    logWithContext('Starting database connection attempt...');
    logWithContext(`Environment: NODE_ENV=${process.env.NODE_ENV}`);
    
    try {
        validateMongoURI(process.env.DB_URI);
        logWithContext('MongoDB URI validation successful');
    } catch (error) {
        logWithContext('MongoDB URI validation failed', error);
        throw error;
    }

    for (let i = 0; i < retries; i++) {
        try {
            logWithContext(`Connection attempt ${i + 1}/${retries}...`);
            
            await mongoose.connect(process.env.DB_URI, connectionParams);
            logWithContext("Database Connected Successfully");

            mongoose.connection.on('error', err => {
                logWithContext('MongoDB connection error', err);
            });

            mongoose.connection.on('disconnected', () => {
                logWithContext('MongoDB disconnected. Attempting to reconnect...');
            });

            mongoose.connection.on('reconnected', () => {
                logWithContext('MongoDB reconnected');
            });

            // Log connection details
            const { host, port, name } = mongoose.connection;
            logWithContext(`Connected to MongoDB at ${host}:${port}/${name}`);
            
            return;
        } catch (err) {
            logWithContext(`Database Connection Error (attempt ${i + 1}/${retries})`, err);
            
            // Enhanced error reporting
            if (err.name === 'MongoServerSelectionError') {
                logWithContext('Failed to find available MongoDB servers. Please check:');
                logWithContext('1. Network connectivity');
                logWithContext('2. MongoDB Atlas whitelist settings');
                logWithContext('3. DNS resolution');
            } else if (err.name === 'MongoParseError') {
                logWithContext('Invalid MongoDB connection string');
            } else if (err.name === 'MongoTimeoutError') {
                logWithContext('Connection attempt timed out');
            }

            if (i < retries - 1) {
                logWithContext(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }
};

const connectDatabase = async () => {
    try {
        await connectWithRetry();
    } catch (err) {
        logWithContext("All database connection attempts failed", err);
        throw err;
    }
};

connectDatabase.mongoose = mongoose;
module.exports = connectDatabase;