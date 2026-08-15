'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/utils/image';

export default function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedBlog, setSelectedBlog] = useState(null);

    const defaultArticles = [
        {
            _id: '1',
            title: 'Top 5 Festive Styling Tips for Jamdani & Silk Sarees in 2026',
            category: 'Ethnic Trends',
            author: 'AVARONI Fashion Desk',
            readTime: '5 min read',
            createdAt: new Date().toISOString(),
            imageUrl: '/img/profile_image.jpg',
            content: `
                <p>Jamdani and Katan sarees represent the pinnacle of Bengali textile artistry. To elevate your festive style, pair traditional weaves with contrasting raw silk blouses, statement oxidized silver earrings, and delicate floral hair adornments.</p>
                <h4>1. Layer with Statement Ornaments</h4>
                <p>A minimalist Jamdani drape shines brightest when paired with artisanal choker necklaces and Kundan bangles from our handcrafted collection.</p>
                <h4>2. Modern Blouse Cuts</h4>
                <p>Experiment with contemporary boat necks or cape-style sleeves to bring a modern runway aesthetic to timeless heritage weaves.</p>
            `
        },
        {
            _id: '2',
            title: 'How to Choose Breathable & Comfortable Outfits for Kids',
            category: 'Kids Fashion',
            author: 'Parenting & Style Team',
            readTime: '4 min read',
            createdAt: new Date().toISOString(),
            imageUrl: '/img/categories/kids.jpg',
            content: `
                <p>Kids love running and playing during family gatherings and festive celebrations. Choosing soft cotton inner linings and elasticated waistbands ensures they stay cheerful and stylish all day long.</p>
                <h4>100% Cotton Comfort</h4>
                <p>Always inspect ethnic wear for soft linings that protect delicate skin from embroidery friction.</p>
            `
        },
        {
            _id: '3',
            title: 'The Ultimate Guide to Handcrafted Jewelry Care & Maintenance',
            category: 'Jewelry Care',
            author: 'Master Artisans',
            readTime: '3 min read',
            createdAt: new Date().toISOString(),
            imageUrl: '/img/categories/jewellery.png',
            content: `
                <p>Keep your precious Kundan, Meenakari, and oxidized jewelry sparkling like new with simple storage and maintenance habits.</p>
                <h4>Keep Away from Moisture & Perfume</h4>
                <p>Always apply perfumes and hairsprays before putting on your jewelry. Store each piece in an airtight ziplock pouch with silica gel.</p>
            `
        }
    ];

    useEffect(() => {
        async function fetchBlogs() {
            setLoading(true);
            try {
                const res = await fetch('/api/blogs');
                const data = await res.json();
                if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
                    setBlogs(data.blogs);
                } else {
                    setBlogs(defaultArticles);
                }
            } catch (err) {
                console.warn('Using default blogs fallback:', err);
                setBlogs(defaultArticles);
            } finally {
                setLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    const categories = ['all', ...Array.from(new Set(blogs.map(b => b.category || b.tag || 'General').filter(Boolean)))];

    const filteredBlogs = blogs.filter(b => {
        if (activeCategory === 'all') return true;
        return (b.category || b.tag || '').toLowerCase() === activeCategory.toLowerCase();
    });

    return (
        <div style={{ background: '#f5f5f7', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #111111 0%, #1f1f1f 50%, #2a111e 100%)',
                color: '#ffffff',
                padding: '65px 20px 55px',
                textAlign: 'center',
                borderBottom: '3px solid rgba(230, 0, 80, 0.3)'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(230, 0, 80, 0.2)',
                    color: '#ff80aa',
                    border: '1px solid rgba(230, 0, 80, 0.4)',
                    padding: '6px 18px',
                    borderRadius: '30px',
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    marginBottom: '18px'
                }}>
                    <i className="fas fa-newspaper"></i> Trends & Styling Inspiration
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                    Fashion & <span style={{ color: '#ff80aa' }}>Styling Blog</span>
                </h1>
                <p style={{ color: '#d1d5db', maxWidth: '650px', margin: '0 auto 25px', lineHeight: '1.6' }}>
                    Discover ethnic fashion guides, seasonal collection highlights, saree draping techniques, and jewelry care tips from the style experts at AVARONI.
                </p>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '30px auto 0', padding: '0 20px' }}>
                {/* Category Bar */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '35px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '30px',
                                border: '1px solid ' + (activeCategory === cat ? '#e60050' : '#e5e7eb'),
                                background: activeCategory === cat ? '#e60050' : '#ffffff',
                                color: activeCategory === cat ? '#ffffff' : '#374151',
                                fontWeight: '700',
                                fontSize: '13px',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                        >
                            {cat === 'all' ? 'All Articles' : cat}
                        </button>
                    ))}
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#e60050', marginBottom: '12px' }}></i>
                        <p>Loading curated articles...</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '25px'
                    }}>
                        {filteredBlogs.map(blog => (
                            <div
                                key={blog._id}
                                onClick={() => setSelectedBlog(blog)}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                            >
                                <div style={{ position: 'relative', height: '200px', background: '#111827', overflow: 'hidden' }}>
                                    <img
                                        src={getImageUrl(blog.imageUrl || blog.image || '/img/profile_image.jpg')}
                                        alt={blog.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = '/img/profile_image.jpg'; }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        background: '#e60050',
                                        color: '#ffffff',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase'
                                    }}>
                                        {blog.category || blog.tag || 'Fashion'}
                                    </span>
                                </div>
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', display: 'flex', gap: '10px' }}>
                                        <span><i className="fas fa-user-edit"></i> {blog.author || 'AVARONI Desk'}</span>
                                        <span>•</span>
                                        <span><i className="far fa-clock"></i> {blog.readTime || '4 min read'}</span>
                                    </div>
                                    <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: '800', color: '#111827', lineHeight: '1.4' }}>
                                        {blog.title}
                                    </h3>
                                    <p style={{ margin: '0 0 15px', color: '#4b5563', fontSize: '13px', lineHeight: '1.6', flex: 1 }}>
                                        {blog.shortDescription || (blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 110) + '...' : '')}
                                    </p>
                                    <div style={{ color: '#e60050', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        Read Full Article <i className="fas fa-arrow-right"></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Blog Reader Modal */}
                {selectedBlog && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            maxWidth: '750px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '30px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setSelectedBlog(null)}
                                style={{
                                    position: 'absolute',
                                    top: '18px',
                                    right: '18px',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                &times;
                            </button>
                            <span style={{
                                display: 'inline-block',
                                background: 'rgba(230,0,80,0.1)',
                                color: '#e60050',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '700',
                                marginBottom: '12px'
                            }}>
                                {selectedBlog.category || selectedBlog.tag || 'Fashion'}
                            </span>
                            <h2 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: '800', color: '#111827' }}>
                                {selectedBlog.title}
                            </h2>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                                By {selectedBlog.author || 'AVARONI Stylist'} • {selectedBlog.readTime || '4 min read'}
                            </div>
                            <img
                                src={getImageUrl(selectedBlog.imageUrl || selectedBlog.image || '/img/profile_image.jpg')}
                                alt={selectedBlog.title}
                                style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }}
                                onError={(e) => { e.target.src = '/img/profile_image.jpg'; }}
                            />
                            <div
                                style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8' }}
                                dangerouslySetInnerHTML={{ __html: selectedBlog.content || '<p>Article details coming soon.</p>' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
