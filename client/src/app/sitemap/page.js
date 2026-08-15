'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SitemapPage() {
    const [categories, setCategories] = useState([]);
    const [filterQuery, setFilterQuery] = useState('');

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.success && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Failed to fetch sitemap categories', err);
            }
        }
        fetchCategories();
    }, []);

    const sitemapSections = [
        {
            title: 'Main Store Pages',
            icon: 'fa-store',
            links: [
                { name: 'Homepage', href: '/', icon: 'fa-home', badge: 'Main' },
                { name: 'Shopping Cart', href: '/cart', icon: 'fa-shopping-bag', badge: 'Cart' },
                { name: 'Checkout', href: '/checkout', icon: 'fa-credit-card' },
                { name: 'Wishlist & Saved Items', href: '/wishlist', icon: 'fa-heart' }
            ]
        },
        {
            title: 'Collections & Categories',
            icon: 'fa-tags',
            links: categories.length > 0 ? categories.map(cat => ({
                name: cat.displayName || cat.name,
                href: cat.redirectUrl ? (cat.redirectUrl.endsWith('.html') ? cat.redirectUrl.replace(/\.html$/, '') : cat.redirectUrl) : `/category/${encodeURIComponent(cat.slug || cat.name.toLowerCase())}`,
                icon: 'fa-tag'
            })) : [
                { name: 'Women Collection', href: '/category/women', icon: 'fa-female' },
                { name: 'Kids Collection', href: '/category/kids', icon: 'fa-child' },
                { name: 'Ornaments & Jewelry', href: '/category/ornament', icon: 'fa-gem' }
            ]
        },
        {
            title: 'Customer Services & Support',
            icon: 'fa-compass',
            links: [
                { name: 'Track Order', href: '/track-order', icon: 'fa-truck', badge: 'Live' },
                { name: 'Frequently Asked Questions (FAQ)', href: '/faq', icon: 'fa-question-circle' },
                { name: 'Fashion & Styling Blog', href: '/blog', icon: 'fa-newspaper' },
                { name: 'About AVARONI', href: '/about', icon: 'fa-info-circle' },
                { name: 'Contact & Support', href: '/contact', icon: 'fa-envelope' }
            ]
        },
        {
            title: 'Account & Policies',
            icon: 'fa-shield-alt',
            links: [
                { name: 'My Profile & Orders', href: '/profile', icon: 'fa-user-circle' },
                { name: 'Return & Exchange Policy', href: '/return-policy', icon: 'fa-file-contract' },
                { name: 'Submit Return Request', href: '/return-product', icon: 'fa-undo' },
                { name: 'Admin Portal', href: '/admin.html', icon: 'fa-lock' }
            ]
        }
    ];

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
                    <i className="fas fa-sitemap"></i> Complete Website Index
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                    Website <span style={{ color: '#ff80aa' }}>Sitemap</span>
                </h1>
                <p style={{ color: '#d1d5db', maxWidth: '650px', margin: '0 auto 25px', lineHeight: '1.6' }}>
                    Explore all pages, product categories, policies, and customer support resources on AVARONI.
                </p>

                {/* Filter Search */}
                <div style={{
                    maxWidth: '580px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    padding: '12px 20px',
                    borderRadius: '50px',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <i className="fas fa-search" style={{ color: '#ff80aa', marginRight: '12px' }}></i>
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Filter pages (e.g. return, track, saree, policy)..."
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontSize: '15px'
                        }}
                    />
                </div>
            </div>

            {/* Sitemap Grid */}
            <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {sitemapSections.map((section, idx) => {
                        const filteredLinks = section.links.filter(l =>
                            !filterQuery || l.name.toLowerCase().includes(filterQuery.toLowerCase())
                        );

                        if (filteredLinks.length === 0) return null;

                        return (
                            <div
                                key={idx}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '10px',
                                        background: 'rgba(230, 0, 80, 0.1)',
                                        color: '#e60050',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px'
                                    }}>
                                        <i className={`fas ${section.icon}`}></i>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#111827' }}>
                                        {section.title}
                                    </h3>
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {filteredLinks.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            <Link
                                                href={link.href}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    background: '#f9fafb',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <i className={`fas ${link.icon}`} style={{ color: '#e60050', width: '16px' }}></i>
                                                    {link.name}
                                                </span>
                                                {link.badge ? (
                                                    <span style={{
                                                        background: '#e60050',
                                                        color: '#ffffff',
                                                        fontSize: '10px',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {link.badge}
                                                    </span>
                                                ) : (
                                                    <i className="fas fa-chevron-right" style={{ fontSize: '11px', color: '#9ca3af' }}></i>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
