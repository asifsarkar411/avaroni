'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/utils/image';

export default function Sidebar({ isOpen, onClose }) {
    const [categories, setCategories] = useState([]);
    const [brandLogo, setBrandLogo] = useState('/img/profile_image.jpg');
    const [brandName, setBrandName] = useState('AVARONI');
    const [openCategory, setOpenCategory] = useState(null);

    useEffect(() => {
        async function fetchSettingsAndCategories() {
            try {
                const [catRes, setRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/settings')
                ]);
                
                const catData = await catRes.json();
                if (catData.success) {
                    setCategories(catData.categories);
                }

                const setData = await setRes.json();
                if (setData.success) {
                    if (setData.settings.brandLogo) setBrandLogo(setData.settings.brandLogo);
                    if (setData.settings.brandName) setBrandName(setData.settings.brandName);
                }
            } catch (err) {
                console.error("Sidebar category fetch error", err);
            }
        }
        fetchSettingsAndCategories();
    }, []);

    const toggleAccordion = (catId) => {
        setOpenCategory(prev => (prev === catId ? null : catId));
    };

    return (
        <div id="sidebar" className={'sidebar ' + (isOpen ? 'active' : '')}>
            <div className="sidebar-header">
                <Link href="/" className="sidebar-brand" onClick={onClose}>
                    <img src={brandLogo} alt="Logo" className="sidebar-logo" />
                    <span>{brandName}</span>
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
                        url = `/category/${url.replace(/^\//, '')}`;
                    }
                }

                const catId = cat._id || cat.slug || cat.name;
                const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
                const isExpanded = openCategory === catId;
                
                if (hasSubs) {
                    return (
                        <div key={catId} className={`sidebar-category-wrapper ${isExpanded ? 'open' : ''}`}>
                            <button
                                type="button"
                                className="sidebar-category-btn"
                                onClick={() => toggleAccordion(catId)}
                            >
                                <span className="cat-btn-content">
                                    <img src={getImageUrl(cat.iconUrl || cat.icon || cat.image)} alt="" loading="lazy" />
                                    <span>{cat.displayName || cat.name}</span>
                                </span>
                                <i className="fas fa-chevron-down sidebar-chevron"></i>
                            </button>
                            <div className="sidebar-subcategories">
                                <Link href={url} onClick={onClose} className="sidebar-sub-link all-sub-link">
                                    <i className="fas fa-th-large"></i> All {cat.displayName || cat.name}
                                </Link>
                                {cat.subcategories.map((sub, idx) => (
                                    <Link key={idx} href={`${url}?sub=${encodeURIComponent(sub)}`} onClick={onClose} className="sidebar-sub-link">
                                        <i className="fas fa-minus"></i> {sub}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={catId} className="sidebar-category-wrapper">
                        <Link href={url} onClick={onClose} className="sidebar-category-btn">
                            <span className="cat-btn-content">
                                <img src={getImageUrl(cat.iconUrl || cat.icon || cat.image)} alt="" loading="lazy" />
                                <span>{cat.displayName || cat.name}</span>
                            </span>
                        </Link>
                    </div>
                );
            })}
            
            <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.1)', margin: '15px 0' }} />
            
            <div style={{ padding: '10px 15px', color: '#999', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Links</div>
            <a href="/track-order"><i className="fas fa-truck"></i> Track Order</a>
            <a href="/faq"><i className="fas fa-question-circle"></i> FAQ</a>
            <a href="/blog"><i className="fas fa-newspaper"></i> Blog</a>
            <a href="/sitemap"><i className="fas fa-sitemap"></i> Sitemap</a>
            <a href="/about"><i className="fas fa-info-circle"></i> About Us</a>
            <Link href="/contact"><i className="fas fa-envelope"></i> Contact</Link>
        </div>
    );
}
