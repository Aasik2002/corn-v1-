const express = require('express');
const router = express.Router();
const multer = require('multer');

const { analyzeScan,getScanHistory } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware'); // Security Gate

// Setup Multer to store the uploaded image temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/scan
// 1. protect -> Checks if user is logged in (Token)
// 2. upload.single('file') -> Receives the image file
// 3. analyzeScan -> Sends it to Python & saves to DB
router.post('/', protect, upload.single('file'), analyzeScan);

// @route   GET /api/scan/history
router.get('/history', protect, getScanHistory);

module.exports = router;