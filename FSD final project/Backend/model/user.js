const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    employeeCode: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Frontend Developer', 'Backend Developer', 'QA', 'Project Manager', 'UI/UX Designer'],
        default: 'Frontend Developer'
    }
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);