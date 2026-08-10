'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import { calculateDiscountedPrice, formatDiscountTag } from '@/utils/price';
import { useRouter } from 'next/navigation';

export default function ProductModal() {
    const router = useRouter();
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

    // Tab state
    const [activeTab, setActiveTab] = useState('DESCRIPTION');

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

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColour, setSelectedColour] = useState('');
    const [quantity, setQuantity] = useState(1);

    const close = () => {
        setIsOpen(false);
        setProduct(null);
        setRelatedProducts([]);
        setReviewName('');
        setReviewComment('');
        setReviewRating(5);
        setSelectedSize('');
        setSelectedColour('');
        setQuantity(1);
        setActiveTab('DESCRIPTION');
        document.body.style.overflow = 'auto';
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity, selectedSize, selectedColour);
        close();
    };

    const handleBuyNow = () => {
        if (!product) return;
        addToCart(product, quantity, selectedSize, selectedColour);
        close();
        router.push('/checkout');
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
                        <div className="product-modal-body modal-two-column">
                            <div className="modal-left-column" style={{position: 'relative'}}>
                                {formatDiscountTag(product.discountType, product.discountValue) && <div style={{position: 'absolute', top: '15px', left: '15px', background: '#3b82f6', color: 'white', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '13px', fontWeight: 'bold', zIndex: 2}}>{formatDiscountTag(product.discountType, product.discountValue)}</div>}
                                <img src={getImageUrl(product.imageUrl)} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }} />
                            </div>
                            <div className="modal-right-column">
                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#111' }}>{product.name}</h2>
                                <div className="modal-meta-row" style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
                                    <div><strong>Availability:</strong> <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>In Stock</span></div>
                                    <div><strong>SKU:</strong> {product._id.substring(0, 6).toUpperCase()}</div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>
                                    <strong>Category:</strong> <span style={{ textTransform: 'capitalize' }}>{product.category}</span>
                                </div>

                                <div className="modal-price-area" style={{ marginBottom: '20px' }}>
                                    {formatDiscountTag(product.discountType, product.discountValue) ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>৳ {calculateDiscountedPrice(product.price, product.discountType, product.discountValue)}</span>
                                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px' }}>৳ {product.price}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginTop: '5px' }}>
                                                YOU SAVE ৳ {product.price - calculateDiscountedPrice(product.price, product.discountType, product.discountValue)} ({formatDiscountTag(product.discountType, product.discountValue).replace('-', '')} OFF)
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>৳ {product.price}</div>
                                    )}
                                </div>

                                {product.size && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>SELECT SIZE: <span style={{color: 'red'}}>*</span></div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {product.size.split(',').map(s => s.trim()).map(sz => sz && (
                                                <button 
                                                    key={sz} 
                                                    className={`size-selector-btn ${selectedSize === sz ? 'active' : ''}`}
                                                    onClick={() => setSelectedSize(sz)}
                                                >
                                                    {sz}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {product.colour && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>SELECT COLOUR:</div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {product.colour.split(',').map(c => c.trim()).map(col => col && (
                                                <button 
                                                    key={col} 
                                                    className={`size-selector-btn ${selectedColour === col ? 'active' : ''}`}
                                                    onClick={() => setSelectedColour(col)}
                                                >
                                                    {col}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>QUANTITY:</div>
                                    <div className="quantity-selector">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                        <input type="text" value={quantity} readOnly />
                                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                    </div>
                                </div>

                                <div className="action-btn-group" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                    <button className="btn add-to-cart-outline" onClick={handleAddToCart} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #111', color: '#111', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <i className="fas fa-shopping-cart"></i> Add to Cart
                                    </button>
                                    <button className="btn buy-now-fill" onClick={handleBuyNow} style={{ flex: 1, padding: '12px', background: '#111', border: '1px solid #111', color: '#fff', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <i className="fas fa-lock"></i> Buy Now
                                    </button>
                                </div>

                                <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', marginBottom: '10px' }}>NEED HELP? CONTACT US:</div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <a href="tel:+8801234567890" style={{ flex: 1, padding: '8px', border: '1px solid #eee', textAlign: 'center', color: '#333', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}><i className="fas fa-phone"></i> Call</a>
                                        <a href="https://wa.me/8801234567890" target="_blank" rel="noreferrer" style={{ flex: 1, padding: '8px', border: '1px solid #eee', textAlign: 'center', color: '#333', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}><i className="fab fa-whatsapp"></i> WhatsApp</a>
                                        <a href="#" style={{ flex: 1, padding: '8px', border: '1px solid #eee', textAlign: 'center', color: '#333', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}><i className="fab fa-facebook-messenger"></i> Messenger</a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* TABBED SECTION */}
                        <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                                {['DESCRIPTION', 'ADDITIONAL INFORMATION', 'REVIEWS (1)'].map((tab) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{ 
                                            background: 'none', border: 'none', 
                                            padding: '10px 0', 
                                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                                            color: activeTab === tab ? '#111' : '#666',
                                            borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
                                            cursor: 'pointer', fontSize: '14px',
                                            marginBottom: '-1px'
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            
                            <div style={{ minHeight: '150px' }}>
                                {activeTab === 'DESCRIPTION' && (
                                    <div 
                                        style={{ fontSize: '14px', lineHeight: '1.8', color: '#444' }}
                                        dangerouslySetInnerHTML={{ __html: product.description || '<p>Premium quality product.</p>' }}
                                    ></div>
                                )}
                                
                                {activeTab === 'ADDITIONAL INFORMATION' && (
                                    <div style={{ fontSize: '14px', color: '#555' }}>
                                        <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
                                        <p><strong>Weight:</strong> 0.5 kg (Approx)</p>
                                        <p><strong>Care Instructions:</strong> Machine wash cold, do not bleach.</p>
                                    </div>
                                )}

                                {activeTab === 'REVIEWS (1)' && (
                                    <div style={{ fontSize: '14px', color: '#555' }}>
                                        <h4 style={{ fontSize: '16px', color: '#111', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <i className="fas fa-star" style={{ color: '#ffc107' }}></i> Rate & Review Product
                                        </h4>
                                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 15px 0' }}>Share your star rating and honest opinion</p>
                                        
                                        <form onSubmit={handleReviewSubmit} style={{ maxWidth: '600px' }}>
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
                                                            style={{ transition: 'transform 0.2s', transform: star <= hoverRating ? 'scale(1.2)' : 'scale(1)' }}
                                                        ></i>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>Your Name:</label>
                                                <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Enter your full name" required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                                            </div>

                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>Review Comment:</label>
                                                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Write your review comments here..." required rows="3" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical' }}></textarea>
                                            </div>

                                            <button type="submit" disabled={isSubmittingReview} style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 24px', fontSize: '13px', fontWeight: 'bold', borderRadius: '25px', cursor: isSubmittingReview ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                <i className="fas fa-paper-plane"></i> {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    </div>
                                )}
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
