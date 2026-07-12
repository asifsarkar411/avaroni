const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true }, // e.g. "Women Dress", "Ornament", "Kids Zone"
    slug: { type: String, required: true },        // e.g. "women", "ornament", "kids"
    subcategories: [{ type: String }]
});

module.exports = mongoose.model('Category', categorySchema);
