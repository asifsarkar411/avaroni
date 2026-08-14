const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['click', 'dead_click', 'exit_page'],
        required: true
    },
    page: {
        type: String,
        required: true
    },
    element: {
        type: String
    },
    className: {
        type: String
    },
    text: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
