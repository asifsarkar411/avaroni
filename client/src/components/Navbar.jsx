'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';

export default function Navbar({ onMenuClick }) {
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                if (data.success) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error("Navbar category fetch error", err);
            }
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length >= 2 || (selectedCategory && searchQuery.trim().length >= 1)) {
                setIsSearching(true);
                try {
                    const categoryParam = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
                    const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}${categoryParam}`);
                    const data = await res.json();
                    if (data.success) {
                        setSearchResults(data.products.slice(0, 5));
                    }
                } catch (e) {
                    console.error("Search failed", e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <nav className="navbar">
            <Link href="/" className="logo">
                <img src="/img/profile_image.jpg" alt="Logo" className="nav-logo" />
                <b>AVARONI</b>
            </Link>
            
            <div className="search-bar-container" ref={searchRef}>
                <div className="search-bar-inner">
                    <div className="search-input-wrap" style={{ display: 'flex', alignItems: 'center' }}>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="search-category-select"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <i className="fas fa-search search-bar-icon" style={{ marginLeft: '10px' }}></i>
                        <input 
                            type="text" 
                            id="global-search-input" 
                            placeholder="Search for products..." 
                            autoComplete="off" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear-btn" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Search Dropdown */}
                {(searchResults.length > 0 || isSearching) && (
                    <div id="search-results-dropdown" className="search-results-dropdown active" style={{display: 'block'}}>
                        {isSearching ? (
                            <div style={{padding: '15px', textAlign: 'center', color: '#666'}}>Searching...</div>
                        ) : (
                            searchResults.map(product => (
                                <div key={product._id} className="search-result-item" onClick={() => {
                                    // Trigger modal open via custom event
                                    window.dispatchEvent(new CustomEvent('openProductModal', { detail: product._id }));
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}>
                                    <img src={getImageUrl(product.imageUrl)} alt={product.name} />
                                    <div className="search-result-info">
                                        <h4>{product.name}</h4>
                                        <p>BDT {product.price}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                            <div style={{padding: '15px', textAlign: 'center', color: '#666'}}>No products found</div>
                        )}
                    </div>
                )}
            </div>

            <div className="nav-links">
                <Link href="/cart" className="cart-icon" title="Cart">
                    <i className="fas fa-shopping-cart"></i>
                    <span className="cart-badge" style={{ display: cartCount > 0 ? 'inline-block' : 'none' }}>{cartCount}</span>
                </Link>
                <Link href="/wishlist" className="wishlist-icon" title="Wishlist">
                    <i className="far fa-heart"></i>
                    <span className="wishlist-badge" style={{ display: wishlist.length > 0 ? 'inline-block' : 'none' }}>{wishlist.length}</span>
                </Link>
                <Link href="/profile" className="user-nav-btn" title="Profile">
                    <i className="far fa-user"></i>
                </Link>
                <i onClick={onMenuClick} className="fas fa-bars menu-icon" style={{cursor: 'pointer', fontSize: '24px', marginLeft: '15px', color: '#333'}}></i>
            </div>
        </nav>
    );
}
