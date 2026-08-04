'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import { calculateDiscountedPrice, formatDiscountTag } from '@/utils/price';

export default function ProductModal() {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Review state
    const [reviewName, setReviewName] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const handleOpenModal = async (e) => {
            const productId = e.detail;
            setIsOpen(true);
            setLoading(true);
            document.body.style.overflow = 'hidden';
            
            try {
                // Fetch product details
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                
                if (data.success) {
                    setProduct(data.product);
                    
                    // Fetch related products from same category
                    if (data.product.category) {
                        const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}`);
                        const relData = await relRes.json();
                        if (relData.success) {
                            // Filter out current product and limit to 4
                            setRelatedProducts(relData.products.filter(p => p._id !== productId).slice(0, 4));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product details", err);
            } finally {
                setLoading(false);
            }
        };

        window.addEventListener('openProductModal', handleOpenModal);
        return () => window.removeEventListener('openProductModal', handleOpenModal);
    }, []);

    const close = () => {
        setIsOpen(false);
        setProduct(null);
        setRelatedProducts([]);
        setReviewName('');
        setReviewComment('');
        setReviewRating(5);
        document.body.style.overflow = 'auto';
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewName.trim() || !reviewComment.trim()) {
            alert("Please enter your name and comment.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    productName: product.name,
                    reviewerName: reviewName.trim(),
                    rating: reviewRating,
                    comment: reviewComment.trim()
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(data.message || "Thank you! Your review has been submitted for admin approval.");
                setReviewName('');
                setReviewComment('');
                setReviewRating(5);
            } else {
                alert(data.message || "Failed to submit review.");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="product-modal-overlay" style={{display: 'flex'}} onClick={close}>
            <div className="product-modal" onClick={e => e.stopPropagation()}>
                <button className="product-modal-close" onClick={close}><i className="fas fa-times"></i></button>
                
                {loading ? (
                    <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>
                ) : product ? (
                    <>
                        <div className="product-modal-body">
                            <div className="product-modal-image" style={{position: 'relative'}}>
                                {formatDiscountTag(product.discountType, product.discountValue) && <div style={{position: 'absolute', top: '15px', left: '15px', background: '#e60050', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', zIndex: 2}}>{formatDiscountTag(product.discountType, product.discountValue)}</div>}
                                <img src={getImageUrl(product.imageUrl)} alt={product.name} />
                            </div>
                            <div className="product-modal-info">
                                <span className="product-modal-category">{product.category}</span>
                                <h2>{product.name}</h2>
                                <p className="product-modal-price">
                                    {formatDiscountTag(product.discountType, product.discountValue) ? (
                                        <>
                                            <span style={{textDecoration: 'line-through', color: '#999', marginRight: '10px', fontSize: '1.2rem'}}>BDT {product.price}</span>
                                            <span style={{color: '#e60050'}}>BDT {calculateDiscountedPrice(product.price, product.discountType, product.discountValue)}</span>
                                        </>
                                    ) : (
                                        `BDT ${product.price}`
                                    )}
                                </p>
                                <p className="product-modal-stock" style={{color: product.stockQuantity > 0 ? 'green' : 'red'}}>
                                    {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                </p>
                                <div style={{ margin: '15px 0', fontSize: '14px', lineHeight: '1.6', color: '#555', borderTop: '1px dotted #ddd', borderBottom: '1px dotted #ddd', padding: '10px 0' }}>
                                    {product.description || 'No description available.'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                                    <button 
                                        className="btn add-to-cart-btn product-modal-cart-btn" 
                                        disabled={product.stockQuantity <= 0}
                                        onClick={() => {
                                            addToCart(product);
                                            close();
                                        }}
                                        style={{ flex: 1, marginRight: '10px' }}
                                    >
                                        <i className="fas fa-cart-plus"></i> {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                    <button
                                        onClick={() => toggleWishlist(product)}
                                        style={{ 
                                            padding: '10px 15px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #ddd', 
                                            background: isInWishlist(product._id) ? 'rgba(230,0,80,0.05)' : '#fff', 
                                            cursor: 'pointer',
                                            fontSize: '1.2rem',
                                            color: isInWishlist(product._id) ? '#e60050' : '#888'
                                        }}
                                    >
                                        <i className={isInWishlist(product._id) ? "fas fa-heart" : "far fa-heart"}></i>
                                    </button>
                                </div>

                                {/* Review Form Section */}
                                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #e2b0c5' }}>
                                    <h4 style={{ fontSize: '16px', color: '#111', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-star" style={{ color: '#ffc107' }}></i> Rate & Review Product
                                    </h4>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 15px 0' }}>Share your star rating and honest opinion</p>
                                    
                                    <form onSubmit={handleReviewSubmit}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>Star Rating:</label>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '24px', color: '#ffc107', cursor: 'pointer' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i 
                                                        key={star}
                                                        className={star <= (hoverRating || reviewRating) ? "fas fa-star" : "far fa-star"}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setReviewRating(star)}
                                                        style={{ 
                                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                            transform: star <= hoverRating ? 'scale(1.3)' : 'scale(1)'
                                                        }}
                                                    ></i>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>Your Name:</label>
                                            <input 
                                                type="text" 
                                                value={reviewName}
                                                onChange={(e) => setReviewName(e.target.value)}
                                                placeholder="Enter your full name" 
                                                required 
                                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ffccd8', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>Review Comment:</label>
                                            <textarea 
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Write your review comments here..." 
                                                required 
                                                rows="3" 
                                                style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                                            ></textarea>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isSubmittingReview}
                                            style={{ 
                                                background: '#111111', color: '#fff', border: 'none', padding: '10px 24px', fontSize: '13px', fontWeight: '700', borderRadius: '25px', cursor: isSubmittingReview ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: isSubmittingReview ? 0.7 : 1
                                            }}
                                        >
                                            <i className="fas fa-paper-plane"></i> {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {relatedProducts.length > 0 && (
                            <div className="related-products-section">
                                <h3><i className="fas fa-th-large"></i> Related Products</h3>
                                <div className="related-products-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '15px'}}>
                                    {relatedProducts.map(rel => {
                                        const finalPrice = calculateDiscountedPrice(rel.price, rel.discountType, rel.discountValue);
                                        const discountTag = formatDiscountTag(rel.discountType, rel.discountValue);
                                        return (
                                        <div key={rel._id} className="related-product-card" onClick={() => window.dispatchEvent(new CustomEvent('openProductModal', { detail: rel._id }))} style={{cursor: 'pointer', border: '1px solid #eee', borderRadius: '8px', padding: '10px', textAlign: 'center', position: 'relative'}}>
                                            {discountTag && <div style={{position: 'absolute', top: '5px', left: '5px', background: '#e60050', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', zIndex: 2}}>{discountTag}</div>}
                                            <img src={getImageUrl(rel.imageUrl)} alt={rel.name} style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px'}} />
                                            <h4 style={{fontSize: '14px', margin: '10px 0 5px'}}>{rel.name}</h4>
                                            <p style={{color: '#111111', fontWeight: 'bold', margin: 0}}>
                                                {discountTag ? (
                                                    <>
                                                        <span style={{textDecoration: 'line-through', color: '#999', marginRight: '5px', fontSize: '12px'}}>BDT {rel.price}</span>
                                                        <span style={{color: '#e60050'}}>BDT {finalPrice}</span>
                                                    </>
                                                ) : (
                                                    `BDT ${rel.price}`
                                                )}
                                            </p>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{padding: '40px', textAlign: 'center'}}>Product not found.</div>
                )}
            </div>
        </div>
    );
}
