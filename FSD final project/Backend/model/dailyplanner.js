const mongoose = require('mongoose');

const dailyPlannerSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
        required: true
    },
    assignedUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        name: String,
        employeeCode: String,
        role: String
    }],
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { 
    timestamps: true,
    collection: 'dailyplanners' // Explicitly set collection name (pluralized)
});

module.exports = mongoose.model("dailyPlanner", dailyPlannerSchema);