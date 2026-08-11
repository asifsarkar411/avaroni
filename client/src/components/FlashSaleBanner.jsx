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
        <div style={{
            margin: '40px calc(50% - 50vw)',
            background: 'linear-gradient(135deg, #fdfbf7, #f4eee6)',
            borderTop: '1px solid #eaeaea',
            borderBottom: '1px solid #eaeaea',
            padding: '20px 15px'
        }}>
            <section data-aos="fade-up" style={{
                margin: '0 auto',
                maxWidth: '1200px',
                color: '#333',
                padding: 'clamp(15px, 4vw, 20px)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                    marginBottom: '15px',
                    boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)'
                }}>
                    <i className="fas fa-bolt"></i> FLASH SALE
                </div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: '#111' }}>{flashSale.title || 'Special Offer'}</h2>
                <p style={{ margin: '0 0 20px 0', color: '#555', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>{flashSale.description || 'Grab it before it\'s gone!'}</p>
                <a href={flashSale.linkUrl || '#'} style={{
                    display: 'inline-block',
                    background: '#111',
                    color: 'white',
                    padding: '12px 25px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'; }} 
                   onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; }}>
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
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: 'clamp(8px, 2vw, 15px)',
                        borderRadius: '12px',
                        minWidth: 'clamp(50px, 15vw, 80px)',
                        textAlign: 'center',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', fontWeight: 'bold', color: '#e74c3c' }}>{value.toString().padStart(2, '0')}</div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#666', marginTop: '5px' }}>
                            {unit === 'd' ? 'Days' : unit === 'h' ? 'Hours' : unit === 'm' ? 'Mins' : 'Secs'}
                        </div>
                    </div>
                ))}
            </div>
            </section>
        </div>
    );
}
