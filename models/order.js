const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    transactionId: { type: String, required: true }, // 🌟 NEW: Added Transaction ID
    cartItems: { type: Array, required: true }, 
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'bKash' },
    orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);