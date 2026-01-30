const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Not Started", "In Progress", "On Hold", "Completed"],
        default: "Not Started"
    },
    teamMembers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        name: String,
        employeeCode: String,
        role: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model("project", projectSchema);