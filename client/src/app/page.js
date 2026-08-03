'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavPromoSlider from '@/components/NavPromoSlider';
import HeroSlider from '@/components/HeroSlider';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import ReviewsSlider from '@/components/ReviewsSlider';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        if (catData.success) setCategories(catData.categories);
        if (prodData.success) setProducts(prodData.products.slice(0, 10)); // Just 10 new arrivals
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openProduct = (id) => {
    window.dispatchEvent(new CustomEvent('openProductModal', { detail: id }));
  };

  return (
    <div className="home-container">
        <NavPromoSlider />

        <div className="welcome-section" style={{textAlign: 'center', padding: '20px'}}>
            <h2 data-aos="fade-down" style={{color: '#000000', fontWeight: '700', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '12px', textAlign: 'center', lineHeight: '1.2'}}>
                Elegance Redefined for Every Moment
            </h2>
            <h3 data-aos="fade-up" data-aos-delay="200" style={{color: '#000000', fontWeight: '400', fontSize: 'clamp(0.95rem, 2vw, 1.25rem)', textAlign: 'center', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto'}}>
                Step into a world of curated elegance. From stunning women's wear to sparkling jewellery and cute kids' outfits, upgrade your wardrobe with exclusive designs crafted just for you.
            </h3>
            
            <HeroSlider />
        </div>

        <section className="category-section">
            <div className="category-header">
                <h2 className="section-title" data-aos="fade-up">Shop by Categories</h2>
            </div>
            {loading ? (
                <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
                    <div className="skeleton-loader skeleton-card"></div>
                    <div className="skeleton-loader skeleton-card"></div>
                </div>
            ) : (
                <div className="category-grid" id="category-grid">
                    {categories.map(cat => (
                        <div key={cat._id} className="category-card" data-aos="zoom-in" onClick={() => window.location.href = cat.redirectUrl || `/${cat.name.toLowerCase()}.html`} style={{ cursor: 'pointer' }}>
                            <div className="category-icon-wrap">
                                <img src={cat.icon || cat.image || './img/profile_image.jpg'} alt={cat.name} loading="lazy" className="category-icon-img" />
                            </div>
                            <p className="category-title">{cat.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
        
        <FlashSaleBanner />

        <div className="new-arrivals-section">
            <h2 className="section-title" data-aos="fade-up"><i className="fas fa-sparkles"></i> New Arrivals <i className="fas fa-sparkles"></i></h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">Discover our latest products</p>
            {loading ? (
                <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
                    <div className="skeleton-loader skeleton-card"></div>
                    <div className="skeleton-loader skeleton-card"></div>
                </div>
            ) : (
                <div className="product-grid" id="new-arrivals-grid">
                    {products.map(prod => (
                        <div key={prod._id} className="product-card" data-aos="fade-up">
                            <div className="product-image-wrap" onClick={() => openProduct(prod._id)} style={{ cursor: 'pointer' }}>
                                <button className="wishlist-card-btn" title="Save to Wishlist" onClick={(e) => { e.stopPropagation(); alert('Wishlist added'); }}>
                                    <i className="far fa-heart"></i>
                                </button>
                                <img src={prod.images && prod.images[0] ? (prod.images[0].startsWith('http') ? prod.images[0] : `/uploads/${prod.images[0]}`) : './img/profile_image.jpg'} alt={prod.name} className="product-image" loading="lazy" />
                            </div>
                            <h3 onClick={() => openProduct(prod._id)} style={{ cursor: 'pointer' }}>{prod.name}</h3>
                            <p className="price">BDT {prod.price}</p>
                            <button className="btn add-to-cart-btn" onClick={() => addToCart(prod)} style={{ width: '100%' }}>Add to Cart</button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <ReviewsSlider />
    </div>
  );
}
