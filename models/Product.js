const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String },
    subcategory: { type: String, default: "" },
    // 🌟 NEW: Track availability (defaults to true)
    isAvailable: { type: Boolean, default: true },
    stockQuantity: { type: Number, required: true, default: 1 } // 🌟 NEW: Added Stock tracker
});

module.exports = mongoose.model('Product', productSchema);