const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
    sprintName: {
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
    assignedUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String,
        employeeCode: String,
        role: String
    }],
    status: {
        type: String,
        enum: ["Planning", "Active", "Completed", "On Hold"],
        default: "Planning"
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { 
    timestamps: true,
    collection: 'sprints' // Explicitly set collection name
});

module.exports = mongoose.model("sprint", sprintSchema);