const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        required: true
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sprint"
    },
    assignedTo: [{
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
        enum: ["To Do", "In Progress", "Review", "Done"],
        default: "To Do"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium"
    },
    startDate: Date,
    endDate: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { 
    timestamps: true,
    collection: 'tasks' // Explicitly set collection name
});

module.exports = mongoose.model("task", taskSchema);