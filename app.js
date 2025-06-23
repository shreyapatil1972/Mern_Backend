const express = require('express');
const cors = require('cors');
const path = require('path'); 

require('dotenv').config();
require('./config/db'); // MongoDB connection
const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const categoryRoute = require('./routes/categoryRoute');
// const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => res.send('🛋️ Furniture E-commerce API Running'));
app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/category', categoryRoute);

// Serve static files (e.g., image uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Server
app.listen(port, () => console.log(`  Server running on http://localhost:${port}`));
