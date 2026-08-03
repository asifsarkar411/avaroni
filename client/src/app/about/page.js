'use client';
import Link from 'next/link';

export default function About() {
  return (
    <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(15px)', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', textAlign: 'center' }} data-aos="fade-up">
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '20px', color: '#111', letterSpacing: '-1px' }}>
                About <span style={{ color: '#ff4d4f' }}>AVARONI</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.8', marginBottom: '30px', maxWidth: '700px', margin: '0 auto 30px auto' }}>
                Welcome to AVARONI. We believe that true elegance lies in the perfect balance of comfort, quality, and timeless style. Born out of a passion for high-end fashion accessible to everyone, AVARONI offers a curated collection of stunning women's wear, sparkling jewellery, and absolutely adorable kids' outfits.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '40px', textAlign: 'left' }}>
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} data-aos="fade-up" data-aos-delay="100">
                    <i className="fas fa-gem" style={{ fontSize: '30px', color: '#ff4d4f', marginBottom: '15px' }}></i>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Premium Quality</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>Every piece is crafted with meticulous attention to detail and superior materials.</p>
                </div>
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} data-aos="fade-up" data-aos-delay="200">
                    <i className="fas fa-heart" style={{ fontSize: '30px', color: '#ff4d4f', marginBottom: '15px' }}></i>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Customer First</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>Your satisfaction is our ultimate goal. We're here to make your shopping experience magical.</p>
                </div>
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} data-aos="fade-up" data-aos-delay="300">
                    <i className="fas fa-truck-fast" style={{ fontSize: '30px', color: '#ff4d4f', marginBottom: '15px' }}></i>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Fast Delivery</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>Get your favorite styles delivered swiftly and securely right to your doorstep.</p>
                </div>
            </div>
            
            <div style={{ marginTop: '50px' }} data-aos="zoom-in" data-aos-delay="400">
                <Link href="/" style={{ display: 'inline-block', padding: '12px 30px', background: 'linear-gradient(135deg, #111, #333)', color: '#fff', borderRadius: '50px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                    Explore Our Collection
                </Link>
            </div>
        </div>
    </div>
  );
}
