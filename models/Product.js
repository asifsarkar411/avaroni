const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String },
    subcategory: { type: String, default: "" },
    size: { type: String, default: "" },
    colour: { type: String, default: "" },
    brand: { type: String, default: "" },
    // 🌟 NEW: Track availability (defaults to true)
    isAvailable: { type: Boolean, default: true },
    stockQuantity: { type: Number, required: true, default: 1 }, // 🌟 NEW: Added Stock tracker
    discountType: { type: String, enum: ['flat', 'percentage', 'none'], default: 'none' },
    discountValue: { type: Number, default: 0 }
});

productSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);