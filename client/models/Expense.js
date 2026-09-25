const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, default: 'General' },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Cash' },
    note: { type: String },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
