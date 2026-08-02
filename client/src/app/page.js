'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
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

  return (
    <div className="home-container">
        <div className="welcome-section" style={{textAlign: 'center', padding: '20px'}}>
            <h2 data-aos="fade-down" style={{color: '#000000', fontWeight: '700', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '12px', textAlign: 'center', lineHeight: '1.2'}}>
                Elegance Redefined for Every Moment
            </h2>
            <h3 data-aos="fade-up" data-aos-delay="200" style={{color: '#000000', fontWeight: '400', fontSize: 'clamp(0.95rem, 2vw, 1.25rem)', textAlign: 'center', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto'}}>
                Step into a world of curated elegance. From stunning women's wear to sparkling jewellery and cute kids' outfits, upgrade your wardrobe with exclusive designs crafted just for you.
            </h3>
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
                        <div key={cat._id} className="category-card" data-aos="fade-up" onClick={() => window.location.href = `/shop/${cat.name.toLowerCase()}`}>
                            <img src={cat.image} alt={cat.name} loading="lazy" />
                            <div className="category-info">
                                <h3>{cat.name}</h3>
                                <button className="shop-btn">Explore</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        <div className="new-arrivals-section">
            <h2 className="section-title" data-aos="fade-up"><i className="fas fa-sparkles"></i> New Arrivals <i className="fas fa-sparkles"></i></h2>
            <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">Discover our latest products</p>
            {loading ? (
                <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
                    <div className="skeleton-loader skeleton-card"></div>
                    <div className="skeleton-loader skeleton-card"></div>
                </div>
            ) : (
                <div className="product-grid" style={{padding: '20px'}}>
                    {products.map(prod => (
                        <div key={prod._id} className="product-card" data-aos="fade-up">
                            <div className="product-image">
                                <img src={prod.images && prod.images[0] ? prod.images[0] : './img/profile_image.jpg'} alt={prod.name} loading="lazy" />
                            </div>
                            <div className="product-details">
                                <h3 className="product-name">{prod.name}</h3>
                                <div className="product-price">
                                    <span className="price">BDT {prod.price}</span>
                                </div>
                                <button className="add-to-cart-btn btn" onClick={() => alert('Add to cart')}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
