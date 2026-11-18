const Scan = require('../models/Scan');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const { generateCropReportPDF } = require('../utils/pdfGenerator');
const { sendReportEmail } = require('../utils/emailService');

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

// @desc    Get aggregated dashboard stats (vitality, weekly, monthly, and 7-day disease trends)
// @route   GET /api/scan/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const scans = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });

        const normalizeDisease = (name) => {
            if (!name) return 'Unknown';
            const clean = name.toString().trim().toLowerCase().replace(/[\s_-]+/g, '');
            if (clean.includes('rust')) return 'Common_Rust';
            if (clean.includes('gray') || clean.includes('grey') || clean.includes('leafspot')) return 'Gray_Leaf';
            if (clean.includes('health')) return 'Healthy';
            if (clean.includes('notcorn') || clean.includes('noncorn')) return 'Not_Corn';
            return name;
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Crop vitality calculation (percentage of healthy scans among corn leaves)
        const healthyCount = scans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;
        const cornScans = scans.filter(s => normalizeDisease(s.diseaseName) !== 'Not_Corn');
        const vitality = cornScans.length > 0 
            ? parseFloat(((healthyCount / cornScans.length) * 100).toFixed(1)) 
            : (scans.length === 0 ? 100.0 : 0.0);

        // Weekly scans (past 7 days)
        const weeklyScans = scans.filter(s => new Date(s.createdAt) >= sevenDaysAgo);
        const weeklyTotal = weeklyScans.length;
        const weeklyCR = weeklyScans.filter(s => normalizeDisease(s.diseaseName) === 'Common_Rust').length;
        const weeklyGR = weeklyScans.filter(s => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length;
        const weeklyHT = weeklyScans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;

        // Monthly scans (past 30 days)
        const monthlyScans = scans.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
        const monthlyTotal = monthlyScans.length;
        const monthlyCR = monthlyScans.filter(s => normalizeDisease(s.diseaseName) === 'Common_Rust').length;
        const monthlyGR = monthlyScans.filter(s => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length;
        const monthlyHT = monthlyScans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;

        // Trend: Monday to Sunday of the current week
        const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const monday = new Date(now);
        const currentDay = monday.getDay();
        const distanceToMonday = (currentDay + 6) % 7;
        monday.setDate(monday.getDate() - distanceToMonday);
        monday.setHours(0, 0, 0, 0);

        const trendWeekly = daysOfWeek.map((dayName, index) => {
            const targetDate = new Date(monday);
            targetDate.setDate(monday.getDate() + index);

            const dayScans = scans.filter(s => {
                const d = new Date(s.createdAt);
                return (
                    d.getFullYear() === targetDate.getFullYear() &&
                    d.getMonth() === targetDate.getMonth() &&
                    d.getDate() === targetDate.getDate()
                );
            });

            return {
                name: dayName,
                commonRust: dayScans.filter(s => normalizeDisease(s.diseaseName) === 'Common_Rust').length,
                grayLeaf: dayScans.filter(s => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length,
                total: dayScans.length,
                dateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
        });

        // Trend: Rolling 7 days ending today
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const trendRolling7 = [];
        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() - i);
            targetDate.setHours(0, 0, 0, 0);

            const dayScans = scans.filter(s => {
                const d = new Date(s.createdAt);
                return (
                    d.getFullYear() === targetDate.getFullYear() &&
                    d.getMonth() === targetDate.getMonth() &&
                    d.getDate() === targetDate.getDate()
                );
            });

            const dayName = i === 0 ? 'TODAY' : dayNames[targetDate.getDay()];
            trendRolling7.push({
                name: dayName,
                commonRust: dayScans.filter(s => normalizeDisease(s.diseaseName) === 'Common_Rust').length,
                grayLeaf: dayScans.filter(s => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length,
                total: dayScans.length,
                dateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
        }

        res.status(200).json({
            vitality,
            totalScans,
            weekly: {
                total: weeklyTotal,
                cr: weeklyCR,
                gr: weeklyGR,
                ht: weeklyHT
            },
            monthly: {
                total: monthlyTotal,
                cr: monthlyCR,
                gr: monthlyGR,
                ht: monthlyHT
            },
            trendWeekly,
            trendRolling7
        });
    } catch (error) {
        console.error('Fetch Stats Error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Download PDF Scan Report (weekly or monthly)
// @route   GET /api/scan/report/download
// @access  Private
const downloadScanReportPDF = async (req, res) => {
    try {
        const period = (req.query.period || 'weekly').toLowerCase();
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date();
        const timeLimit = period === 'monthly'
            ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const scans = await Scan.find({
            user: req.user.id,
            createdAt: { $gte: timeLimit }
        }).sort({ createdAt: -1 });

        const normalizeDisease = (name) => {
            if (!name) return 'Unknown';
            const clean = name.toString().trim().toLowerCase().replace(/[\s_-]+/g, '');
            if (clean.includes('rust')) return 'Common_Rust';
            if (clean.includes('gray') || clean.includes('grey') || clean.includes('leafspot')) return 'Gray_Leaf';
            if (clean.includes('health')) return 'Healthy';
            if (clean.includes('notcorn') || clean.includes('noncorn')) return 'Not_Corn';
            return name;
        };

        const healthyCount = scans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;
        const cornScans = scans.filter(s => normalizeDisease(s.diseaseName) !== 'Not_Corn');
        const vitality = cornScans.length > 0 
            ? parseFloat(((healthyCount / cornScans.length) * 100).toFixed(1)) 
            : (scans.length === 0 ? 100.0 : 0.0);

        const cr = scans.filter(s => normalizeDisease(s.diseaseName) === 'Common_Rust').length;
        const gr = scans.filter(s => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length;
        const ht = scans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;

        const stats = {
            total: scans.length,
            vitality,
            cr,
            gr,
            ht
        };

        const pdfBuffer = await generateCropReportPDF({
            user,
            period,
            scans,
            stats
        });

        const safeFilename = `CornAI_${period}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Generation Error:', error.message);
        res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
    }
};

// @desc    Email PDF Scan Report (weekly or monthly) to user's email
// @route   POST /api/scan/report/email
// @access  Private
const emailScanReport = async (req, res) => {
    try {
        const period = (req.body.period || req.query.period || 'weekly').toLowerCase();
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipientEmail = req.body.recipientEmail || user.email;
        if (!recipientEmail) {
            return res.status(400).json({ message: 'No valid recipient email address found' });
        }

        const now = new Date();
        const timeLimit = period === 'monthly'
            ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const scans = await Scan.find({
            user: req.user.id,
            createdAt: { $gte: timeLimit }
        }).sort({ createdAt: -1 });

        const normalizeDisease = (name) => {
            if (!name) return 'Unknown';
            const clean = name.toString().trim().toLowerCase().replace(/[\s_-]+/g, '');
            if (clean.includes('rust')) return 'Common_Rust';
            if (clean.includes('gray') || clean.includes('grey') || clean.includes('leafspot')) return 'Gray_Leaf';
            if (clean.includes('health')) return 'Healthy';
            if (clean.includes('notcorn') || clean.includes('noncorn')) return 'Not_Corn';
            return name;
        };

        const healthyCount = scans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;
        const cornScans = scans.filter(s => normalizeDisease(s.diseaseName) !== 'Not_Corn');
        const vitality = cornScans.length > 0 
            ? parseFloat(((healthyCount / cornScans.length) * 100).toFixed(1)) 
            : (scans.length === 0 ? 100.0 : 0.0);

        const cr = scans.filter(s => normalizeDisease(s.diseaseName) === 'Common_Rust').length;
        const gr = scans.filter(s => normalizeDisease(s.diseaseName) === 'Gray_Leaf').length;
        const ht = scans.filter(s => normalizeDisease(s.diseaseName) === 'Healthy').length;

        const stats = {
            total: scans.length,
            vitality,
            cr,
            gr,
            ht
        };

        const pdfBuffer = await generateCropReportPDF({
            user,
            period,
            scans,
            stats
        });

        const safeFilename = `CornAI_${period}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

        const emailResult = await sendReportEmail({
            to: recipientEmail,
            farmerName: user.fullName || 'Farmer',
            period,
            stats,
            pdfBuffer,
            filename: safeFilename
        });

        res.status(200).json({
            message: `Report successfully dispatched to ${recipientEmail}!`,
            period,
            recipient: recipientEmail,
            previewUrl: emailResult.previewUrl
        });
    } catch (error) {
        console.error('Email Report Error:', error.message);
        res.status(500).json({ message: 'Failed to dispatch report email', error: error.message });
    }
};

// @desc    Delete a single scan record permanently
// @route   DELETE /api/scan/:id
// @access  Private
const deleteScan = async (req, res) => {
    try {
        const { id } = req.params;
        const scan = await Scan.findOne({ _id: id, user: req.user.id });
        if (!scan) {
            return res.status(404).json({ message: 'Scan not found or unauthorized' });
        }
        await Scan.deleteOne({ _id: id, user: req.user.id });
        res.status(200).json({ 
            success: true, 
            message: 'Scan permanently deleted successfully', 
            deletedId: id 
        });
    } catch (error) {
        console.error('Delete Scan Error:', error.message);
        res.status(500).json({ message: 'Failed to delete scan record', error: error.message });
    }
};

// @desc    Delete scan history permanently (all, week data, month data)
// @route   DELETE /api/scan/history
// @access  Private
const deleteScanHistory = async (req, res) => {
    try {
        const range = (req.query.range || req.body.range || 'all').toLowerCase();
        let filter = { user: req.user.id };

        const now = new Date();
        if (range === 'week') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: sevenDaysAgo };
        } else if (range === 'month') {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: thirtyDaysAgo };
        } else if (range === 'all') {
            filter = { user: req.user.id };
        } else {
            return res.status(400).json({ message: 'Invalid range parameter. Expected: all, week, or month.' });
        }

        const result = await Scan.deleteMany(filter);

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} scan(s) permanently (${range}).`,
            deletedCount: result.deletedCount,
            range
        });
    } catch (error) {
        console.error('Bulk Delete Scan History Error:', error.message);
        res.status(500).json({ message: 'Failed to delete scan history', error: error.message });
    }
};

module.exports = { 
    analyzeScan, 
    getScanHistory, 
    getDashboardStats,
    downloadScanReportPDF,
    emailScanReport,
    deleteScan,
    deleteScanHistory
};