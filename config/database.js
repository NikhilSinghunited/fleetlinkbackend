const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Remove deprecated options and simplify connection
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,        // Close sockets after 45s of inactivity
      family: 4,                     // Use IPv4, skip IPv6
      maxPoolSize: 10                // Maximum number of sockets in the connection pool
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Event listeners for connection monitoring
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    // Graceful shutdown
    process.exit(1);
  }
};

// For Docker/local development differences
const getMongoURI = () => {
  if (process.env.NODE_ENV === 'development' && process.env.DOCKER_ENV) {
    return 'mongodb://root:example@mongo:27017/fleetlink?authSource=admin';
  }
  return process.env.MONGODB_URI;
};

module.exports = connectDB;