const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    purchaseNo: { type: String, required: true, unique: true },
    supplier: { type: String, required: true },
    products: [{
        name: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true, default: 0 },
        totalPrice: { type: Number, required: true, default: 0 }
    }],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Received', 'Pending', 'Ordered'], default: 'Received' },
    date: { type: Date, default: Date.now },
    notes: { type: String }
});

module.exports = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
