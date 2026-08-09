const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true }, // e.g. 10 for 10% or 150 for ৳150
    minOrderAmount: { type: Number, default: 0 }, // Minimum cart total to use the promo
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);
