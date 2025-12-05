const mongoose = require('mongoose');
require('dotenv').config();

// Use MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
  });

module.exports = mongoose;
