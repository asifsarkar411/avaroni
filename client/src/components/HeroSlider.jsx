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
            <div id="slider-container" data-aos="zoom-in" data-aos-delay="400" style={{textAlign: 'center', margin: '20px'}}>
                <div className="skeleton-loader skeleton-slider"></div>
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }} onClick={() => {
                    if(banner.redirectUrl) window.location.href = banner.redirectUrl;
                }}>
                    <img src={getImageUrl(banner.imageUrl)} alt={banner.title || 'Promo Banner'} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }} />
                    {banner.title && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(10px)',
                            padding: '15px 25px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            maxWidth: '60%'
                        }}>
                            <h2 style={{margin: '0 0 5px 0', color: '#111', fontSize: '1.5rem'}}>{banner.title}</h2>
                            {banner.subtitle && <p style={{margin: 0, color: '#444'}}>{banner.subtitle}</p>}
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
