const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
