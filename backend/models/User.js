const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    organization: {
        type: String,
        default: 'Independent Farmer'
    },
    role: {
        type: String,
        default: 'User' 
    },
    resetCode: {
        type: String,
        default: null
    },
    resetCodeExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true }); 


module.exports = mongoose.model('User', userSchema);