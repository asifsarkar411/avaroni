'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/utils/image';

export default function Sidebar({ isOpen, onClose }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.success) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error("Sidebar category fetch error", err);
            }
        }
        fetchCategories();
    }, []);

    return (
        <div id="sidebar" className={'sidebar ' + (isOpen ? 'active' : '')}>
            <div className="sidebar-header">
                <Link href="/" className="sidebar-brand" onClick={onClose}>
                    <img src="/img/profile_image.jpg" alt="Logo" className="sidebar-logo" />
                    <span>AVARONI</span>
                </Link>
                <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="close-btn">&times;</a>
            </div>
            
            <div style={{ padding: '10px 15px', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Categories</div>
            {categories.map(cat => {
                let url = cat.redirectUrl || `/category/${cat.slug || cat.name.toLowerCase()}`;
                
                // Cleanup old HTML extensions
                if (url.endsWith('.html')) {
                    url = url.replace(/\.html$/, '');
                    
                    // Special cases for categories that used to be root html files
                    if (['/women', '/kids', '/ornament', 'women', 'kids', 'ornament'].includes(url)) {
                        // Ensure leading slash when constructing the route
                        url = `/category/${url.replace(/^\//, '')}`;
                    }
                }
                
                return (
                    <a key={cat._id} href={url} onClick={onClose}>
                        <img src={getImageUrl(cat.iconUrl || cat.icon || cat.image)} alt="" style={{width: '20px', height: '20px', display: 'inline-block', marginRight: '10px', verticalAlign: 'middle', borderRadius: '50%'}} />
                        {cat.name}
                    </a>
                );
            })}
            
            <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '15px 0' }} />
            
            <div style={{ padding: '10px 15px', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Links</div>
            <a href="/track-order"><i className="fas fa-truck"></i> Track Order</a>
            <a href="/faq"><i className="fas fa-question-circle"></i> FAQ</a>
            <a href="/blog"><i className="fas fa-newspaper"></i> Blog</a>
            <a href="/sitemap"><i className="fas fa-sitemap"></i> Sitemap</a>
            <a href="/return-product"><i className="fas fa-undo"></i> Return Product</a>
            <a href="/return-policy"><i className="fas fa-file-contract"></i> Return Policy</a>
            <a href="/about"><i className="fas fa-info-circle"></i> About Us</a>
            <Link href="/contact"><i className="fas fa-envelope"></i> Contact</Link>
        </div>
    );
}
