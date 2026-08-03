'use client';
import { useState, useEffect } from 'react';

export default function FlashSaleBanner() {
    const [flashSale, setFlashSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        async function fetchFlashSale() {
            try {
                const res = await fetch('/api/flash-sale');
                const data = await res.json();
                if (data.success && data.flashSale && data.flashSale.isActive) {
                    setFlashSale(data.flashSale);
                }
            } catch (err) {
                console.error("Error fetching flash sale", err);
            }
        }
        fetchFlashSale();
    }, []);

    useEffect(() => {
        if (!flashSale || !flashSale.endTime) return;
        
        const targetTime = new Date(flashSale.endTime).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = targetTime - now;
            
            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }
            
            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [flashSale]);

    if (!flashSale) return null;

    return (
        <section data-aos="fade-up" style={{
            margin: '40px auto',
            maxWidth: '1200px',
            background: 'linear-gradient(135deg, #111, #333)',
            color: 'white',
            borderRadius: '16px',
            padding: 'clamp(15px, 4vw, 30px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'relative', zIndex: 1, flex: '1', minWidth: '300px' }}>
                <div style={{
                    display: 'inline-block',
                    background: '#e74c3c',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '15px'
                }}>
                    <i className="fas fa-bolt"></i> FLASH SALE
                </div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.2rem, 5vw, 2rem)' }}>{flashSale.title || 'Special Offer'}</h2>
                <p style={{ margin: '0 0 20px 0', color: '#ccc', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>{flashSale.description || 'Grab it before it\'s gone!'}</p>
                <a href={flashSale.linkUrl || '#'} style={{
                    display: 'inline-block',
                    background: 'white',
                    color: '#111',
                    padding: '12px 25px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s ease',
                }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                   onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    Shop Now <i className="fas fa-arrow-right" style={{marginLeft: '8px'}}></i>
                </a>
            </div>
            
            <div style={{
                display: 'flex',
                gap: '15px',
                position: 'relative',
                zIndex: 1,
                marginTop: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: 'clamp(8px, 2vw, 15px)',
                        borderRadius: '12px',
                        minWidth: 'clamp(50px, 15vw, 80px)',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', fontWeight: 'bold' }}>{value.toString().padStart(2, '0')}</div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#aaa', marginTop: '5px' }}>
                            {unit === 'd' ? 'Days' : unit === 'h' ? 'Hours' : unit === 'm' ? 'Mins' : 'Secs'}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
