const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: String, default: '' },
    productName: { type: String, default: 'General Review' },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
