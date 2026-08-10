'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import { calculateDiscountedPrice, formatDiscountTag } from '@/utils/price';

export default function TabbedProductSection({ title, tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const activeSection = tabs[activeTab].sectionFilter;
        // e.g. sectionFilter = 'topSelling' -> /api/products?section=topSelling
        const url = activeSection ? `/api/products?section=${activeSection}` : '/api/products';
        const res = await fetch(url, { headers: { 'ngrok-skip-browser-warning': 'true' } });
        const data = await res.json();
        if (data.success) {
          setProducts(data.products.slice(0, 10)); // Limit to 10 for display
        }
      } catch (err) {
        console.error("Error fetching tab products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeTab, tabs]);

  const openProduct = (id) => {
    window.dispatchEvent(new CustomEvent('openProductModal', { detail: id }));
  };

  return (
    <div className="tabbed-section">
      <div className="section-header-centered">
        <h2>{title}</h2>
        <div className="tabs-container">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              className={`tab-btn ${activeTab === idx ? 'active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="product-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-loader skeleton-card" style={{ height: '350px' }}></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          No products found in this section.
        </div>
      ) : (
        <div className="product-grid">
          {products.map(prod => {
            const finalPrice = calculateDiscountedPrice(prod.price, prod.discountType, prod.discountValue);
            const discountTag = formatDiscountTag(prod.discountType, prod.discountValue);
            return (
              <div key={prod._id} className="product-card" data-aos="fade-up">
                <div className="product-image-wrap" onClick={() => openProduct(prod._id)}>
                  {discountTag && (
                    <div className="discount-badge">{discountTag}</div>
                  )}
                  <button 
                    className="wishlist-card-btn" 
                    title="Save to Wishlist" 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prod); }} 
                    style={{ color: isInWishlist(prod._id) ? '#e60050' : '#888' }}
                  >
                    <i className={isInWishlist(prod._id) ? "fas fa-heart" : "far fa-heart"}></i>
                  </button>
                  <img src={getImageUrl(prod.imageUrl)} alt={prod.name} className="product-image" loading="lazy" />
                </div>
                <div className="product-info-wrap" onClick={() => openProduct(prod._id)}>
                  <h3 className="product-name">{prod.name}</h3>
                  <div className="product-rating">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="far fa-star"></i>
                    <span>({Math.floor(Math.random() * 50) + 1})</span>
                  </div>
                  <p className="price">
                    {discountTag ? (
                      <>
                        <span>৳ {finalPrice}</span>
                        <span className="old-price">৳ {prod.price}</span>
                      </>
                    ) : (
                      <span>৳ {prod.price}</span>
                    )}
                  </p>
                </div>
                <div className="card-action-bottom">
                  <button className="btn add-to-cart-btn" onClick={() => addToCart(prod)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
