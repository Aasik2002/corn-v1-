const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // This links the scan to the specific farmer
    },
    imageName: {
        type: String,
        required: true
    },
    diseaseName: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);