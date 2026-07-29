const Scan = require('../models/Scan');
const axios = require('axios');
const FormData = require('form-data');

// @desc    Upload image, get AI prediction, and save history
// @route   POST /api/scan
// @access  Private (Only for logged-in users)
const analyzeScan = async (req, res) => {
    try {
        // 1. Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a corn leaf image' });
        }

        // 2. Prepare the image to send to Python API
        const formData = new FormData();
        // Since we will use 'multer' in memory mode, req.file.buffer has the image data
        formData.append('file', req.file.buffer, req.file.originalname);

        // 3. Send the image to Python FastAPI (AI Brain)
        // Note: Ensure your Python server is running on port 8000
        const pythonApiUrl = 'http://localhost:8000/predict';
        
        const aiResponse = await axios.post(pythonApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // 4. Extract result from Python API response
        // (Assuming Python returns something like { "disease": "Common_Rust", "confidence": 0.94 })
        const diseaseName = aiResponse.data.disease || aiResponse.data.class;
        const confidence = aiResponse.data.confidence;

        // 5. Save the scan result in MongoDB history
        const savedScan = await Scan.create({
            user: req.user.id, // Comes from authMiddleware
            imageName: req.file.originalname,
            diseaseName: diseaseName,
            confidence: confidence
        });

        // 6. Send the final result back to React UI
        res.status(201).json({
            message: 'Image analyzed successfully',
            result: savedScan
        });

    } catch (error) {
        console.error('AI API Error:', error.message);
        res.status(500).json({ message: 'Server Error or AI Model is down', error: error.message });
    }
};

// @desc    Get all scan history for the logged-in user
// @route   GET /api/scan/history
// @access  Private
const getScanHistory = async (req, res) => {
    try {
        // Find scans that belong to the logged-in user (req.user.id)
        // .sort({ createdAt: -1 }) will show the newest scans first
        const scans = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });
        
        res.status(200).json(scans);
    } catch (error) {
        console.error('Fetch History Error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { analyzeScan, getScanHistory };