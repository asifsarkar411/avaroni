const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subtitle: { type: String },
    featuredProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productTitle: { type: String },
    regularPrice: { type: Number },
    salePrice: { type: Number },
    videoUrl: { type: String },
    bannerImage: { type: String },
    features: [{ type: String }],
    reviews: [{
        reviewer: { type: String },
        rating: { type: Number, default: 5 },
        comment: { type: String },
        image: { type: String }
    }],
    isActive: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.LandingPage || mongoose.model('LandingPage', landingPageSchema);
