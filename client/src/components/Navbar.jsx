'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';

export default function Navbar({ onMenuClick }) {
    const router = useRouter();
    const { cartCount } = useCart();
    const { wishlist } = useWishlist();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [brandLogo, setBrandLogo] = useState('/img/profile_image.jpg');
    const [brandName, setBrandName] = useState('AVARONI');
    const searchRef = useRef(null);

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [catRes, setRes, prodRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/settings'),
                    fetch('/api/products')
                ]);
                
                const catData = await catRes.json();
                if (catData.success && Array.isArray(catData.categories)) {
                    setCategories(catData.categories);

                    // Extract all unique subcategories from categories
                    const subSet = new Set();
                    catData.categories.forEach(c => {
                        if (Array.isArray(c.subcategories)) {
                            c.subcategories.forEach(s => {
                                if (s && s.trim()) subSet.add(s.trim());
                            });
                        }
                    });
                    setSubcategories(Array.from(subSet).sort());
                }

                const setData = await setRes.json();
                if (setData.success) {
                    if (setData.settings.brandLogo) setBrandLogo(setData.settings.brandLogo);
                    if (setData.settings.brandName) setBrandName(setData.settings.brandName);
                }

                const prodData = await prodRes.json();
                if (prodData.success && Array.isArray(prodData.products)) {
                    setFeaturedProducts(prodData.products.slice(0, 15));
                    
                    // Also check products for any additional subcategories
                    setSubcategories(prev => {
                        const set = new Set(prev);
                        prodData.products.forEach(p => {
                            if (p.subcategory && p.subcategory.trim()) set.add(p.subcategory.trim());
                        });
                        return Array.from(set).sort();
                    });
                }

            } catch (err) {
                console.error("Navbar data fetch error", err);
            }
        }
        fetchInitialData();
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
        let active = true;
        const delayDebounceFn = setTimeout(async () => {
            // Trigger search if user typed search query OR selected a non-default filter
            const hasQuery = searchQuery.trim().length >= 1;
            const hasFilter = selectedFilter !== 'all';

            if (hasQuery || hasFilter) {
                setIsSearching(true);
                try {
                    let url = `/api/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    if (selectedFilter.startsWith('cat:')) {
                        url += `&category=${encodeURIComponent(selectedFilter.replace('cat:', ''))}`;
                    }
                    const res = await fetch(url);
                    const data = await res.json();
                    if (active && data.success && Array.isArray(data.products)) {
                        let prods = [...data.products];
                        
                        // Subcategory filter
                        if (selectedFilter.startsWith('sub:')) {
                            const targetSub = selectedFilter.replace('sub:', '').toLowerCase();
                            prods = prods.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === targetSub);
                        }

                        // Price sorting
                        if (selectedFilter === 'price-asc') {
                            prods.sort((a, b) => Number(a.price) - Number(b.price));
                        } else if (selectedFilter === 'price-desc') {
                            prods.sort((a, b) => Number(b.price) - Number(a.price));
                        } else if (selectedFilter === 'newest') {
                            prods.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                        }

                        setSearchResults(prods.slice(0, 10));
                    }
                } catch (e) {
                    if (active) console.error("Search failed", e);
                } finally {
                    if (active) setIsSearching(false);
                }
            } else {
                if (active) {
                    setSearchResults([]);
                }
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(delayDebounceFn);
        };
    }, [searchQuery, selectedFilter]);

    const handleFilterChange = (e) => {
        const val = e.target.value;
        setSelectedFilter(val);

        // 1. If user selects a specific product
        if (val.startsWith('prod:')) {
            const prodId = val.replace('prod:', '');
            window.dispatchEvent(new CustomEvent('openProductModal', { detail: prodId }));
            setSelectedFilter('all');
            return;
        }

        // 2. If user selects a category and is not currently typing a search query
        if (val.startsWith('cat:') && searchQuery.trim().length === 0) {
            const catSlug = val.replace('cat:', '');
            router.push(`/category/${catSlug}`);
            return;
        }

        // 3. Dispatch global filter change event for page components
        window.dispatchEvent(new CustomEvent('filterSortChange', { detail: { filter: val } }));
    };

    return (
        <nav className="navbar">
            <Link href="/" className="logo">
                <img src={brandLogo} alt="Logo" className="nav-logo" />
                <b>{brandName}</b>
            </Link>
            
            <div className="search-bar-container" ref={searchRef}>
                <div className="search-bar-inner">
                    <div className="search-input-wrap" style={{ display: 'flex', alignItems: 'center' }}>
                        <select 
                            value={selectedFilter}
                            onChange={handleFilterChange}
                            className="search-category-select"
                            title="Filter & Sort"
                        >
                            <optgroup label="Sort & Filter">
                                <option value="all">All Products</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                            </optgroup>

                            {categories.length > 0 && (
                                <optgroup label="Categories">
                                    {categories.map(cat => (
                                        <option key={cat._id} value={`cat:${(cat.slug || cat.name).toLowerCase()}`}>
                                            {cat.displayName || cat.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {subcategories.length > 0 && (
                                <optgroup label="Subcategories">
                                    {subcategories.map((sub, idx) => (
                                        <option key={idx} value={`sub:${sub.toLowerCase()}`}>
                                            {sub}
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {featuredProducts.length > 0 && (
                                <optgroup label="Products">
                                    {featuredProducts.map(p => (
                                        <option key={p._id} value={`prod:${p._id}`}>
                                            {p.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <i className="fas fa-search search-bar-icon" style={{ marginLeft: '10px' }}></i>
                        <input 
                            type="text" 
                            id="global-search-input" 
                            placeholder="Search for products, categories, or styles..." 
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
                            <div style={{padding: '15px', textAlign: 'center', color: '#666'}}>
                                <i className="fas fa-spinner fa-spin" style={{marginRight: '8px', color: '#e60050'}}></i> Searching products...
                            </div>
                        ) : (
                            searchResults.map(product => (
                                <div key={product._id} className="search-result-item" onClick={() => {
                                    window.dispatchEvent(new CustomEvent('openProductModal', { detail: product._id }));
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}>
                                    <img src={getImageUrl(product.imageUrl)} alt={product.name} />
                                    <div className="search-result-info">
                                        <h4>{product.name}</h4>
                                        <span style={{ fontSize: '12px', color: '#888' }}>
                                            {product.category}{product.subcategory ? ` • ${product.subcategory}` : ''}
                                        </span>
                                    </div>
                                    <span className="search-result-price" style={{ fontWeight: '700', color: '#e60050', marginLeft: 'auto' }}>
                                        ৳{product.price}
                                    </span>
                                </div>
                            ))
                        )}
                        {!isSearching && searchResults.length === 0 && (searchQuery.length >= 1 || selectedFilter !== 'all') && (
                            <div style={{padding: '15px', textAlign: 'center', color: '#666'}}>No products found matching selection</div>
                        )}
                    </div>
                )}
            </div>

            <div className="nav-links">
                <div className="desktop-only-links">
                    <div className="nav-dropdown-wrapper">
                        <span className="dynamic-nav-link" style={{cursor: 'pointer'}}>Categories <i className="fas fa-chevron-down" style={{fontSize: '0.8em', marginLeft: '3px'}}></i></span>
                        <div className="nav-dropdown-content">
                            {categories.length === 0 ? (
                                <div style={{padding: '10px 20px', color: '#999', fontSize: '13px'}}>Loading...</div>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat._id} className="nav-dropdown-item">
                                        <Link href={`/category/${cat.slug || cat.name.toLowerCase()}`}>{cat.name}</Link>
                                        {cat.subcategories && cat.subcategories.length > 0 && (
                                            <div className="nav-subcategories">
                                                {cat.subcategories.map((sub, idx) => (
                                                    <Link key={idx} href={`/category/${cat.slug || cat.name.toLowerCase()}?sub=${encodeURIComponent(sub)}`}>{sub}</Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <Link href="/about" className="dynamic-nav-link">About</Link>
                    <Link href="/contact" className="dynamic-nav-link">Contact</Link>
                </div>
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
