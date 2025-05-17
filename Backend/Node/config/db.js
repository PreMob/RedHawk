const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variable or use default
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('MongoDB connection string not found in environment variables');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 