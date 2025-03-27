const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string from environment variables
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/flux-image-generator';

// Connect to MongoDB
mongoose.connect(connectionString, {
  // Options are no longer needed in Mongoose 8
});

// Log MongoDB connection status
mongoose.connection.on('connected', () => {
  console.log('🗄️  MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = mongoose.connection;