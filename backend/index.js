const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON டேட்டாவை வாங்க

// Test Route
app.get('/', (req, res) => {
    res.send('Corn AI Backend API is running successfully! 🌽');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas Connected Successfully!'))
    .catch((err) => console.log('❌ MongoDB Connection Failed: ', err.message));

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Import Auth Routes
const authRoutes = require('./routes/authRoutes');

// Use Auth Routes
app.use('/api/auth', authRoutes);

// Import Scan Routes
const scanRoutes = require('./routes/scanRoutes');

// Use Scan Routes
app.use('/api/scan', scanRoutes);