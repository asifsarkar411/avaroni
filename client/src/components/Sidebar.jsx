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
            {categories.map(cat => (
                <Link key={cat._id} href={cat.redirectUrl || `/category/${cat.slug || cat.name.toLowerCase()}`} onClick={onClose}>
                    <img src={getImageUrl(cat.iconUrl || cat.icon || cat.image)} alt="" style={{width: '20px', height: '20px', display: 'inline-block', marginRight: '10px', verticalAlign: 'middle', borderRadius: '50%'}} />
                    {cat.name}
                </Link>
            ))}
            
            <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '15px 0' }} />
            
            <div style={{ padding: '10px 15px', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Links</div>
            <a href="/track-order.html"><i className="fas fa-truck"></i> Track Order</a>
            <a href="/faq.html"><i className="fas fa-question-circle"></i> FAQ</a>
            <a href="/blog.html"><i className="fas fa-newspaper"></i> Blog</a>
            <a href="/sitemap.html"><i className="fas fa-sitemap"></i> Sitemap</a>
            <a href="/return-product.html"><i className="fas fa-undo"></i> Return Product</a>
            <a href="/return-policy.html"><i className="fas fa-file-contract"></i> Return Policy</a>
            <a href="/about.html"><i className="fas fa-info-circle"></i> About Us</a>
            <Link href="/contact"><i className="fas fa-envelope"></i> Contact</Link>
        </div>
    );
}
