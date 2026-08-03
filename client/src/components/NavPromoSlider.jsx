'use client';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/utils/image';

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
        <div className="nav-promo-slider" id="nav-promo-slider">
            {sliders.map((slider, index) => (
                <a key={slider._id || index} href={slider.linkUrl || '#'}>
                    <img 
                        src={getImageUrl(slider.imageUrl)} 
                        alt="Promo" 
                        className={index === currentIndex ? 'active' : ''} 
                    />
                </a>
            ))}
        </div>
    );
}
