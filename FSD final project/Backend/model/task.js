const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    projectId: {
        type: String,
        ref: "project",
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    status: {
        type: String,
        enum: ["To Do", "In Progress", "Review", "Done"],
        default: "To Do"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    startDate: Date,
    endDate: Date,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model("task", taskSchema);