'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug; // e.g., 'women'

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

                // Fetch products for this category using the category name (because the backend queries on category name, not slug usually)
                const res = await fetch(`/api/products?category=${encodeURIComponent(actualCategoryQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setProducts(data.products);
                }
            } catch (err) {
                console.error("Error fetching category data:", err);
            }
            setLoading(false);
        }
        
        fetchCategoryData();
    }, [slug]);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="page-title" style={{ textAlign: 'center', margin: '40px 0 20px', color: '#111', fontSize: '2rem', fontWeight: '600' }}>
                {categoryName}
            </h2>
            
            {loading ? (
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div className="skeleton-loader skeleton-card" style={{ width: '250px', height: '350px' }}></div>
                    <div className="skeleton-loader skeleton-card" style={{ width: '250px', height: '350px' }}></div>
                    <div className="skeleton-loader skeleton-card" style={{ width: '250px', height: '350px' }}></div>
                </div>
            ) : products.length > 0 ? (
                <div className="product-grid" id="product-list" style={{ marginTop: '30px' }}>
                    {products.map(prod => (
                        <div key={prod._id} className="product-card" data-aos="fade-up">
                            <div className="product-image-wrap" onClick={() => openProduct(prod._id)} style={{ cursor: 'pointer' }}>
                                <button className="wishlist-card-btn" title="Save to Wishlist" onClick={(e) => { e.stopPropagation(); toggleWishlist(prod); }} style={{ color: isInWishlist(prod._id) ? '#e60050' : '#888' }}>
                                    <i className={isInWishlist(prod._id) ? "fas fa-heart" : "far fa-heart"}></i>
                                </button>
                                <img src={getImageUrl(prod.imageUrl)} alt={prod.name} className="product-image" loading="lazy" />
                            </div>
                            <h3 onClick={() => openProduct(prod._id)} style={{ cursor: 'pointer' }}>{prod.name}</h3>
                            <p className="price">BDT {prod.price}</p>
                            <button className="btn add-to-cart-btn" onClick={() => addToCart(prod)} style={{ width: '100%' }}>Add to Cart</button>
                        </div>
                    ))}
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
