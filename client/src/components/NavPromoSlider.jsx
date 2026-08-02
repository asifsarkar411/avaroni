'use client';
import { useState, useEffect } from 'react';

export default function NavPromoSlider() {
    const [sliders, setSliders] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchSliders() {
            try {
                const res = await fetch('/api/nav-sliders');
                const data = await res.json();
                if (data.success && data.sliders && data.sliders.length > 0) {
                    setSliders(data.sliders);
                }
            } catch (err) {
                console.error("Error fetching nav sliders", err);
            }
        }
        fetchSliders();
    }, []);

    useEffect(() => {
        if (sliders.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sliders.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [sliders.length]);

    if (sliders.length === 0) return null;

    return (
        <div className="nav-promo-slider" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            padding: '10px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            color: '#111',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                transition: 'opacity 0.5s ease-in-out',
                opacity: 1
            }}>
                <a href={sliders[currentIndex].linkUrl || '#'} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <i className="fas fa-bullhorn" style={{marginRight: '8px', color: '#555'}}></i>
                    {sliders[currentIndex].text}
                </a>
            </div>
        </div>
    );
}
