'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import { calculateDiscountedPrice, formatDiscountTag } from '@/utils/price';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug; // e.g., 'women'

    const [masterProducts, setMasterProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('Category');
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const openProduct = (id) => {
        window.dispatchEvent(new CustomEvent('openProductModal', { detail: id }));
    };

    useEffect(() => {
        if (!slug) return;
        
        async function fetchCategoryData() {
            setLoading(true);
            try {
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                let actualCategoryQuery = slug;

                if (catData.success) {
                    const matchedCategory = catData.categories.find(c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
                    if (matchedCategory) {
                        setCategoryName(matchedCategory.displayName || matchedCategory.name);
                        actualCategoryQuery = matchedCategory.name;
                    } else {
                        setCategoryName(slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '));
                    }
                }

                // Fetch products for this category
                const res = await fetch(`/api/products?category=${encodeURIComponent(actualCategoryQuery)}`);
                const data = await res.json();
                if (data.success && Array.isArray(data.products)) {
                    setMasterProducts(data.products);
                    setProducts(data.products);
                }
            } catch (err) {
                console.error("Error fetching category data:", err);
            }
            setLoading(false);
        }
        
        fetchCategoryData();
    }, [slug]);

    // Listen for filter and sort events from Navbar
    useEffect(() => {
        const handleFilterSort = (e) => {
            const filter = e.detail?.filter;
            if (!filter || masterProducts.length === 0) return;

            let result = [...masterProducts];

            if (filter.startsWith('sub:')) {
                const targetSub = filter.replace('sub:', '').toLowerCase();
                result = result.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === targetSub);
            }

            if (filter === 'price-asc') {
                result.sort((a, b) => Number(a.price) - Number(b.price));
            } else if (filter === 'price-desc') {
                result.sort((a, b) => Number(b.price) - Number(a.price));
            } else if (filter === 'newest') {
                result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            }

            setProducts(result);
        };

        window.addEventListener('filterSortChange', handleFilterSort);
        return () => window.removeEventListener('filterSortChange', handleFilterSort);
    }, [masterProducts]);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="page-title" style={{ textAlign: 'center', margin: '40px 0 20px', color: '#111', fontSize: '2rem', fontWeight: '600' }}>
                {categoryName}
            </h2>
            
            {loading ? (
                <div className="product-grid" style={{ marginTop: '30px' }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-shimmer skeleton-image" style={{ height: '240px' }}></div>
                            <div className="skeleton-shimmer skeleton-tag" style={{ width: '40%', height: '12px' }}></div>
                            <div className="skeleton-shimmer skeleton-title" style={{ width: '85%', height: '16px' }}></div>
                            <div className="skeleton-shimmer skeleton-price" style={{ width: '50%', height: '18px' }}></div>
                            <div className="skeleton-shimmer skeleton-btn" style={{ width: '100%', height: '38px', marginTop: '10px' }}></div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="product-grid" id="product-list" style={{ marginTop: '30px' }}>
                    {products.map(prod => {
                        const finalPrice = calculateDiscountedPrice(prod.price, prod.discountType, prod.discountValue);
                        const discountTag = formatDiscountTag(prod.discountType, prod.discountValue);
                        return (
                        <div key={prod._id} className="product-card" data-aos="fade-up">
                            <div className="product-image-wrap img-skeleton-wrap" onClick={() => openProduct(prod._id)} style={{ cursor: 'pointer' }}>
                                {discountTag && <div style={{position: 'absolute', top: '10px', left: '10px', background: '#e60050', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 2}}>{discountTag}</div>}
                                <button className="wishlist-card-btn" title="Save to Wishlist" onClick={(e) => { e.stopPropagation(); toggleWishlist(prod); }} style={{ color: isInWishlist(prod._id) ? '#e60050' : '#888' }}>
                                    <i className={isInWishlist(prod._id) ? "fas fa-heart" : "far fa-heart"}></i>
                                </button>
                                <img 
                                    src={getImageUrl(prod.imageUrl)} 
                                    alt={prod.name} 
                                    className="product-image fast-img" 
                                    loading="lazy" 
                                    decoding="async" 
                                    onLoad={(e) => { e.target.classList.add('loaded'); e.target.parentElement?.classList.add('loaded'); }}
                                    onError={(e) => { e.target.classList.add('loaded'); e.target.parentElement?.classList.add('loaded'); }}
                                />
                            </div>
                            <h3 onClick={() => openProduct(prod._id)} style={{ cursor: 'pointer' }}>{prod.name}</h3>
                            <p className="price">
                                {discountTag ? (
                                    <>
                                        <span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px', fontSize: '14px'}}>BDT {prod.price}</span>
                                        <span style={{color: '#e60050'}}>BDT {finalPrice}</span>
                                    </>
                                ) : (
                                    `BDT ${prod.price}`
                                )}
                            </p>
                            <button className="btn add-to-cart-btn" onClick={() => addToCart(prod)} style={{ width: '100%' }}>Add to Cart</button>
                        </div>
                    )})}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
                    <i className="fas fa-box-open" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ccc' }}></i>
                    <h3>No products found in this category.</h3>
                </div>
            )}
        </div>
    );
}
