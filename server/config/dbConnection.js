const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};
  
const connectDatabase = async () => {
    try {
      if (!process.env.DB_URI) {
        throw new Error('DB_URI environment variable is not defined');
      }

      console.log("Connecting to database...");
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

    } catch (err) {
      console.error("Database Connection Error:", err);
      throw err;
    }
};

connectDatabase.mongoose = mongoose;
module.exports = connectDatabase;