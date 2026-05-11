const mongoose = require('mongoose');

const bannerCardSchema = new mongoose.Schema({
    heading: { type: String, default: '' }, // 🌟 NEW: Added heading field
    // An array of image URLs belonging to this specific card
    images: [{ type: String }], 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BannerCard', bannerCardSchema);