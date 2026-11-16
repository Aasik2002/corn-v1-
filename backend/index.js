const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// 2. Uploads 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Route
app.get('/', (req, res) => {
    res.send('Corn AI Backend API is running successfully! 🌽');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas Connected Successfully!'))
    .catch((err) => console.log('❌ MongoDB Connection Failed: ', err.message));

// Server Setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});