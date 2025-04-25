const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    w: "majority"
};
  
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            if (!process.env.DB_URI) {
                throw new Error('DB_URI environment variable is not defined');
            }

            console.log(`Connecting to database (attempt ${i + 1}/${retries})...`);
            await mongoose.connect(process.env.DB_URI, connectionParams);
            console.log("Database Connected Successfully");

            mongoose.connection.on('error', err => {
                console.error('MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('MongoDB disconnected. Attempting to reconnect...');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
            });

            return;
        } catch (err) {
            console.error(`Database Connection Error (attempt ${i + 1}/${retries}):`, err);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay/1000} seconds...`);
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
        console.error("All database connection attempts failed:", err);
        throw err;
    }
};

connectDatabase.mongoose = mongoose;
module.exports = connectDatabase;