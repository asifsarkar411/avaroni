'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/utils/image';

export default function ProductModal() {
    const { addToCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

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
        document.body.style.overflow = 'auto';
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
                            <div className="product-modal-image">
                                <img src={getImageUrl(product.images?.[0])} alt={product.name} />
                            </div>
                            <div className="product-modal-info">
                                <span className="product-modal-category">{product.category}</span>
                                <h2>{product.name}</h2>
                                <p className="product-modal-price">BDT {product.price}</p>
                                <p className="product-modal-stock" style={{color: product.stock > 0 ? 'green' : 'red'}}>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </p>
                                <div style={{ margin: '15px 0', fontSize: '14px', lineHeight: '1.6', color: '#555', borderTop: '1px dotted #ddd', borderBottom: '1px dotted #ddd', padding: '10px 0' }}>
                                    {product.description || 'No description available.'}
                                </div>
                                <button 
                                    className="btn add-to-cart-btn product-modal-cart-btn" 
                                    disabled={product.stock <= 0}
                                    onClick={() => {
                                        addToCart(product);
                                        close();
                                    }}
                                >
                                    <i className="fas fa-cart-plus"></i> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>

                        {relatedProducts.length > 0 && (
                            <div className="related-products-section">
                                <h3><i className="fas fa-th-large"></i> Related Products</h3>
                                <div className="related-products-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '15px'}}>
                                    {relatedProducts.map(rel => (
                                        <div key={rel._id} className="related-product-card" onClick={() => window.dispatchEvent(new CustomEvent('openProductModal', { detail: rel._id }))} style={{cursor: 'pointer', border: '1px solid #eee', borderRadius: '8px', padding: '10px', textAlign: 'center'}}>
                                            <img src={getImageUrl(rel.images?.[0])} alt={rel.name} style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px'}} />
                                            <h4 style={{fontSize: '14px', margin: '10px 0 5px'}}>{rel.name}</h4>
                                            <p style={{color: '#111111', fontWeight: 'bold', margin: 0}}>BDT {rel.price}</p>
                                        </div>
                                    ))}
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
