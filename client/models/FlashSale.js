const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
    title: { type: String, default: "⚡ Flash Sale Ends In:" },
    subtitle: { type: String, default: "Get Exclusive Discounts Today!" },
    buttonText: { type: String, default: "Shop Now" },
    buttonLink: { type: String, default: "index.html#products" },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    bgColor: { type: String, default: "#111111" },
    textColor: { type: String, default: "#ffffff" },
    accentColor: { type: String, default: "#e60050" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);
