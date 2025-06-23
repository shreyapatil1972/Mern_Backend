const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables

// Use MONGO_URL from .env instead of hardcoding
const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.on('connected', () => {
  console.log(' MongoDB connected successfully');
});

connection.on('error', (error) => {
  console.error(' MongoDB connection failed:', error);
});

module.exports = mongoose;
