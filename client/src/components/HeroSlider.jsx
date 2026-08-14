'use client';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/utils/image';

export default function HeroSlider() {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchBanners() {
            try {
                const res = await fetch('/api/banner-cards');
                const data = await res.json();
                if (data.success && data.cards && data.cards.length > 0) {
                    setBanners(data.cards);
                }
            } catch (err) {
                console.error("Error fetching banners", err);
            }
        }
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [banners.length]);

    if (banners.length === 0) {
        return (
            <div id="slider-container" data-aos="zoom-in" data-aos-delay="400" style={{textAlign: 'center', margin: '20px auto', maxWidth: '1200px'}}>
                <div className="skeleton-slider skeleton-shimmer" style={{ width: '100%', aspectRatio: '21/9', height: 'auto', minHeight: '320px', borderRadius: '16px' }}></div>
            </div>
        );
    }

    return (
        <div id="slider-container" data-aos="zoom-in" data-aos-delay="400" style={{
            position: 'relative',
            maxWidth: '1200px',
            margin: '20px auto',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            aspectRatio: '21/9',
            backgroundColor: '#f8f9fa'
        }}>
            {banners.map((banner, index) => (
                <div key={banner._id} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: index === currentIndex ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    zIndex: index === currentIndex ? 1 : 0,
                    cursor: banner.link ? 'pointer' : 'default'
                }} onClick={() => banner.link && (window.location.href = banner.link)}>
                    <img 
                        src={getImageUrl(banner.images && banner.images[0] ? banner.images[0] : banner.imageUrl)} 
                        alt="Hero Banner" 
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    {banner.heading && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(10px)',
                            padding: 'clamp(10px, 3vw, 15px) clamp(15px, 4vw, 25px)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            maxWidth: '60%'
                        }}>
                            <h2 style={{margin: '0 0 5px 0', color: '#111', fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}>{banner.heading}</h2>
                            {banner.subtitle && <p style={{margin: 0, color: '#444', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'}}>{banner.subtitle}</p>}
                        </div>
                    )}
                </div>
            ))}

            {banners.length > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 2
                }}>
                    {banners.map((_, i) => (
                        <div key={i} onClick={() => setCurrentIndex(i)} style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: i === currentIndex ? '#111' : 'rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease'
                        }} />
                    ))}
                </div>
            )}
        </div>
    );
}
