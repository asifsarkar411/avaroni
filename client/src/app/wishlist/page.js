'use client';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/utils/image';
import Link from 'next/link';
import ProductModal from '@/components/ProductModal';
import { useState } from 'react';

export default function WishlistPage() {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [selectedProductId, setSelectedProductId] = useState(null);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="page-title" style={{ textAlign: 'center', margin: '40px 0 20px', color: '#111', fontSize: '2rem', fontWeight: '600' }}>
                <i className="far fa-heart"></i> My Wishlist
            </h2>
            
            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                    <i className="far fa-heart" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ccc' }}></i>
                    <h3>Your wishlist is empty</h3>
                    <p style={{ marginBottom: '20px' }}>Save your favorite items here to buy them later.</p>
                    <Link href="/" className="btn" style={{ display: 'inline-block' }}>Continue Shopping</Link>
                </div>
            ) : (
                <div className="product-grid" style={{ marginTop: '30px' }}>
                    {wishlist.map(prod => (
                        <div key={prod._id} className="product-card" data-aos="fade-up">
                            <div className="product-image-wrap" onClick={() => setSelectedProductId(prod._id)} style={{ cursor: 'pointer' }}>
                                <button 
                                    className="wishlist-card-btn" 
                                    title="Remove from Wishlist" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        toggleWishlist(prod); 
                                    }}
                                    style={{ color: '#e60050' }}
                                >
                                    <i className="fas fa-heart"></i>
                                </button>
                                <img src={getImageUrl(prod.imageUrl)} alt={prod.name} className="product-image" loading="lazy" />
                            </div>
                            <h3 onClick={() => setSelectedProductId(prod._id)} style={{ cursor: 'pointer' }}>{prod.name}</h3>
                            <p className="price">BDT {prod.price}</p>
                            <button className="btn add-to-cart-btn" onClick={() => { addToCart(prod); toggleWishlist(prod); }} style={{ width: '100%' }}>Move to Cart</button>
                        </div>
                    ))}
                </div>
            )}

            {selectedProductId && (
                <ProductModal 
                    productId={selectedProductId} 
                    onClose={() => setSelectedProductId(null)} 
                />
            )}
        </div>
    );
}
