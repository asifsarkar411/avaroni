const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true }, // 🌟 NEW: Added to match server.js
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    transactionId: { type: String, default: 'N/A' }, // 🌟 FIXED: Removed 'required: true' so COD works
    cartItems: { type: Array, required: true }, 
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String, default: "" },
    shippingFee: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'bKash' },
    orderDate: { type: Date, default: Date.now }
});

orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);