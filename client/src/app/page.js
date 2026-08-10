'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavPromoSlider from '@/components/NavPromoSlider';
import HeroSlider from '@/components/HeroSlider';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import ReviewsSlider from '@/components/ReviewsSlider';
import TabbedProductSection from '@/components/TabbedProductSection';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import { calculateDiscountedPrice, formatDiscountTag } from '@/utils/price';

const FEATURED_TABS = [
    { label: "Top Selling", sectionFilter: "topSelling" },
    { label: "Trending", sectionFilter: "trending" },
    { label: "Top Rated", sectionFilter: "topRated" }
];

const PRODUCT_TABS = [
    { label: "All Products", sectionFilter: "" },
    { label: "New Arrival", sectionFilter: "newArrival" }
];

export default function Home() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const dynamicSubtitles = [
    "Step into a world of curated elegance. Discover exclusive designs crafted just for you.",
    "Upgrade your wardrobe with stunning women's wear, sparkling jewellery, and cute kids' outfits.",
    "Find your perfect style. Experience premium quality and unparalleled elegance every single day."
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = { 'ngrok-skip-browser-warning': 'true' };
        const catRes = await fetch('/api/categories', { headers });
        if (!catRes.ok) throw new Error(`API returned ${catRes.status}`);
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setErrorMsg(err.message || "Failed to load categories.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          setFadeKey(prev => prev + 1);
          setSubtitleIndex(prev => (prev + 1) % dynamicSubtitles.length);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
        <NavPromoSlider />

        <div className="welcome-section" style={{textAlign: 'center', padding: '20px'}}>
            <h2 data-aos="fade-down" style={{color: '#000000', fontWeight: '700', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '12px', textAlign: 'center', lineHeight: '1.2'}}>
                Elegance Redefined for Every Moment
            </h2>
            <h3 key={fadeKey} data-aos="fade-up" data-aos-delay="200" style={{color: '#000000', fontWeight: '400', fontSize: 'clamp(0.95rem, 2vw, 1.25rem)', textAlign: 'center', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto', minHeight: '60px', animation: 'fadeIn 1s ease-in-out'}}>
                {dynamicSubtitles[subtitleIndex]}
            </h3>
            
            <HeroSlider />
        </div>

        <section className="category-section">
            <div className="category-header">
                <div className="category-header-line"></div>
                <div className="category-header-text">
                    <h2 data-aos="fade-up">CATEGORIES</h2>
                    <p data-aos="fade-up" data-aos-delay="100">Browse all the exclusive categories</p>
                </div>
            </div>
            {loading ? (
                <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
                    <div className="skeleton-loader skeleton-card" style={{ height: '400px' }}></div>
                    <div className="skeleton-loader skeleton-card" style={{ height: '400px' }}></div>
                    <div className="skeleton-loader skeleton-card" style={{ height: '400px' }}></div>
                </div>
            ) : (
                <div className="category-grid" id="category-grid">
                    {categories.map(cat => (
                        <div key={cat._id} className="category-card" data-aos="zoom-in" onClick={() => window.location.href = cat.redirectUrl || `/category/${cat.slug || cat.name.toLowerCase()}`}>
                            <div className="category-image-wrap">
                                <img src={getImageUrl(cat.imageUrl || cat.image || cat.iconUrl || cat.icon)} alt={cat.name} loading="lazy" />
                            </div>
                            <p className="category-title">{cat.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
        
        <TabbedProductSection 
            title="FEATURED SECTIONS" 
            tabs={FEATURED_TABS} 
            defaultTab={0} 
        />

        <FlashSaleBanner />

        <TabbedProductSection 
            title="OUR PRODUCTS" 
            tabs={PRODUCT_TABS} 
            defaultTab={0} 
        />

        <ReviewsSlider />
    </div>
  );
}
