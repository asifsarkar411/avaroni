'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/utils/image';
import { getCategoryUrl } from '@/utils/category';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
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
                if (catData.success && Array.isArray(catData.categories)) {
                    setCategories(catData.categories);
                }

                const setData = await setRes.json();
                if (setData.success && setData.settings) {
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
                    <img
                        src={getImageUrl(brandLogo)}
                        alt="Logo"
                        className="sidebar-logo"
                        onError={(e) => { e.target.src = '/img/profile_image.jpg'; }}
                    />
                    <span>{brandName}</span>
                </Link>
                <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="close-btn" aria-label="Close menu">&times;</a>
            </div>
            
            {/* Account / User Status */}
            <div style={{ padding: '10px 15px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Link
                    href="/profile"
                    onClick={onClose}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: user ? '#ecfdf5' : '#f9fafb',
                        borderRadius: '8px',
                        color: user ? '#059669' : '#374151',
                        fontWeight: '700',
                        fontSize: '13px',
                        textDecoration: 'none'
                    }}
                >
                    <i className={user ? 'fas fa-user-check' : 'fas fa-user-circle'} style={{ fontSize: '16px' }}></i>
                    <span>{user ? `My Account (${user.username || 'User'})` : 'Sign In / Register'}</span>
                </Link>
            </div>

            <div style={{ padding: '12px 15px 6px', color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Shop Categories
            </div>
            {categories.map(cat => {
                const url = getCategoryUrl(cat);
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
                                    <img
                                        src={getImageUrl(cat.iconUrl || cat.icon || cat.image)}
                                        alt=""
                                        loading="lazy"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span>{cat.displayName || cat.name}</span>
                                </span>
                                <i className="fas fa-chevron-down sidebar-chevron"></i>
                            </button>
                            <div className="sidebar-subcategories">
                                <Link href={url} onClick={onClose} className="sidebar-sub-link all-sub-link">
                                    <i className="fas fa-th-large"></i> All {cat.displayName || cat.name}
                                </Link>
                                {cat.subcategories.map((sub, idx) => {
                                    const subClean = typeof sub === 'string' ? sub : (sub.name || String(sub));
                                    const subUrl = url.includes('?') 
                                        ? `${url}&sub=${encodeURIComponent(subClean)}` 
                                        : `${url}?sub=${encodeURIComponent(subClean)}`;
                                    return (
                                        <Link key={idx} href={subUrl} onClick={onClose} className="sidebar-sub-link">
                                            <i className="fas fa-minus"></i> {subClean}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={catId} className="sidebar-category-wrapper">
                        <Link href={url} onClick={onClose} className="sidebar-category-btn">
                            <span className="cat-btn-content">
                                <img
                                    src={getImageUrl(cat.iconUrl || cat.icon || cat.image)}
                                    alt=""
                                    loading="lazy"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <span>{cat.displayName || cat.name}</span>
                            </span>
                        </Link>
                    </div>
                );
            })}
            
            <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '15px 0' }} />
            
            <div style={{ padding: '8px 15px 6px', color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Quick Links
            </div>
            <Link href="/track-order" onClick={onClose}><i className="fas fa-truck"></i> Track Order</Link>
            <Link href="/faq" onClick={onClose}><i className="fas fa-question-circle"></i> FAQ & Help</Link>
            <Link href="/blog" onClick={onClose}><i className="fas fa-newspaper"></i> Fashion Blog</Link>
            <Link href="/sitemap" onClick={onClose}><i className="fas fa-sitemap"></i> Sitemap</Link>
            <Link href="/return-product" onClick={onClose}><i className="fas fa-undo"></i> Return Product</Link>
            <Link href="/return-policy" onClick={onClose}><i className="fas fa-file-contract"></i> Return Policy</Link>
            <Link href="/about" onClick={onClose}><i className="fas fa-info-circle"></i> About Us</Link>
            <Link href="/contact" onClick={onClose}><i className="fas fa-envelope"></i> Contact Us</Link>
        </div>
    );
}
