const mongoose = require('mongoose');

const navSliderSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    link: { type: String, default: '' },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NavSlider', navSliderSchema);
