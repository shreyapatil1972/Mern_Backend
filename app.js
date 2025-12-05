const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// DB connection
require('./config/db');

const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const categoryRoute = require('./routes/categoryRoute');

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('🛋️ Furniture E-commerce API Running');
});

app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/category', categoryRoute);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Start server (Render compatible)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
