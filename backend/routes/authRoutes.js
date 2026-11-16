const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🛠️ 'uploads' ஃபோல்டர் இல்லாவிட்டால் தானாகவே உருவாக்க
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const { 
    registerUser,
    loginUser,
    getUserProfile, 
    updateUserProfile, 
    uploadProfileImage,
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// 🛠️ Multer Setup 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user.id : 'user';
        cb(null, `${userId}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/auth/profile
router.put('/profile', protect, updateUserProfile);

// @route   POST /api/auth/profile/image 
router.post('/profile/image', protect, upload.single('image'), uploadProfileImage);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;