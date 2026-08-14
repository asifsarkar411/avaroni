const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, index: true },
    category: { type: String, default: 'Ethnic Trends' },
    tag: { type: String, default: 'Ethnic Trends' },
    author: { type: String, default: 'AVARONI Styling Team' },
    readTime: { type: String, default: '4 min read' },
    excerpt: { type: String, default: '' },
    description: { type: String, default: '' },
    content: { type: String, required: true },
    imageUrl: { type: String, default: './img/profile_image.jpg' },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
