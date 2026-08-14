'use client';
import Link from 'next/link';

export default function About() {
  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', padding: '0 0 60px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #111111 0%, #1f1f1f 50%, #2a111e 100%)',
        color: '#ffffff',
        padding: '65px 20px 55px',
        textAlign: 'center',
        borderBottom: '3px solid rgba(230, 0, 80, 0.3)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(230, 0, 80, 0.2)',
          color: '#ff80aa',
          border: '1px solid rgba(230, 0, 80, 0.4)',
          padding: '6px 18px',
          borderRadius: '30px',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '18px'
        }} data-aos="fade-down">
          <i className="fas fa-crown"></i> The AVARONI Story
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          marginBottom: '15px',
          lineHeight: '1.2'
        }} data-aos="fade-up">
          Crafting Elegance, <span style={{
            background: 'linear-gradient(135deg, #ff4d88 0%, #ff80aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Inspiring Confidence</span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: '#d1d5db',
          maxWidth: '750px',
          margin: '0 auto 20px',
          lineHeight: '1.6'
        }} data-aos="fade-up" data-aos-delay="100">
          Welcome to AVARONI (আভরণী) — your premier fashion sanctuary for premium women's traditional & modern wear, artisanal ornaments, and charming kids' collections.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }} data-aos="fade-up" data-aos-delay="200">
          <Link href="/" style={{ color: '#d1d5db', textDecoration: 'none' }}><i className="fas fa-home"></i> Home</Link>
          <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: '#6b7280' }}></i>
          <span>About Us</span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', margin: '-30px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        
        {/* Story Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '45px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          marginBottom: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }} data-aos="fade-up">
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '18px', lineHeight: '1.3' }}>
              Redefining Ethnic & Contemporary Fashion for <span style={{ color: '#e60050' }}>Every Woman</span>
            </h2>
            <p style={{ color: '#4b5563', fontSize: '15.5px', lineHeight: '1.8', marginBottom: '16px' }}>
              Founded with an unwavering passion for timeless craftsmanship, <strong>AVARONI (আভরণী)</strong> was born out of a desire to make luxurious, high-quality ethnic wear and handcrafted ornaments accessible across all of Bangladesh.
            </p>
            <p style={{ color: '#4b5563', fontSize: '15.5px', lineHeight: '1.8', marginBottom: '20px' }}>
              From resplendent silk sarees and delicately embroidered salwar kameez to sparkling Kundan & oxidized jewelry, each piece in our collection is thoughtfully curated to make you feel radiant, graceful, and authentic on every occasion.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ background: '#fdf2f6', color: '#e60050', border: '1px solid rgba(230, 0, 80, 0.15)', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-gem"></i> Hand-Curated
              </span>
              <span style={{ background: '#fdf2f6', color: '#e60050', border: '1px solid rgba(230, 0, 80, 0.15)', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-shield-alt"></i> 100% Quality Checked
              </span>
              <span style={{ background: '#fdf2f6', color: '#e60050', border: '1px solid rgba(230, 0, 80, 0.15)', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <i className="fas fa-truck"></i> 64 Districts Delivery
              </span>
            </div>
          </div>
          
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 35px rgba(0,0,0,0.12)' }}>
            <img src="/img/profile_image.jpg" alt="AVARONI Craftsmanship" style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff' }}>
              <h4 style={{ color: '#fff', fontSize: '18px', marginBottom: '4px' }}>আভরণী (AVARONI)</h4>
              <p style={{ color: '#e5e7eb', fontSize: '13px', margin: 0 }}>Elegance Redefined for Every Moment</p>
            </div>
          </div>
        </div>

        {/* Pillars Grid */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }} data-aos="fade-up">
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Why Customers Choose AVARONI</h3>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Our commitment to excellence is woven into every design, fabric, and interaction.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '22px', marginBottom: '45px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(0, 0, 0, 0.06)' }} data-aos="fade-up" data-aos-delay="100">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #fdf2f6 0%, #fce7f0 100%)', color: '#e60050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
              <i className="fas fa-medal"></i>
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Artisanal Quality</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Premium fabrics, meticulous stitching, and fine detailing guaranteed on every single garment and accessory.</p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(0, 0, 0, 0.06)' }} data-aos="fade-up" data-aos-delay="200">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #fdf2f6 0%, #fce7f0 100%)', color: '#e60050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
              <i className="fas fa-tags"></i>
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Affordable Luxury</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Exclusive boutique styles crafted with designer flair, brought to you at honest, transparent, and fair prices.</p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(0, 0, 0, 0.06)' }} data-aos="fade-up" data-aos-delay="300">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #fdf2f6 0%, #fce7f0 100%)', color: '#e60050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
              <i className="fas fa-shipping-fast"></i>
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Fast Nationwide Delivery</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Swift 24-48 hr delivery inside Dhaka and rapid shipping across all 64 districts with real-time order tracking.</p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(0, 0, 0, 0.06)' }} data-aos="fade-up" data-aos-delay="400">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #fdf2f6 0%, #fce7f0 100%)', color: '#e60050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px' }}>
              <i className="fas fa-headset"></i>
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Dedicated Support</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Friendly customer care available via Phone, WhatsApp, and Facebook Messenger to assist you with every order.</p>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{
          background: 'linear-gradient(135deg, #111111 0%, #1f1f1f 100%)',
          borderRadius: '20px',
          padding: '40px 30px',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '30px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          marginBottom: '45px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }} data-aos="zoom-in">
          <div>
            <h3 style={{ fontSize: '38px', fontWeight: '800', color: '#ff80aa', marginBottom: '6px' }}>10k+</h3>
            <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Happy Customers</p>
          </div>
          <div>
            <h3 style={{ fontSize: '38px', fontWeight: '800', color: '#ff80aa', marginBottom: '6px' }}>500+</h3>
            <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Curated Designs</p>
          </div>
          <div>
            <h3 style={{ fontSize: '38px', fontWeight: '800', color: '#ff80aa', marginBottom: '6px' }}>64</h3>
            <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Districts Covered</p>
          </div>
          <div>
            <h3 style={{ fontSize: '38px', fontWeight: '800', color: '#ff80aa', marginBottom: '6px' }}>4.9★</h3>
            <p style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Satisfaction Rating</p>
          </div>
        </div>

        {/* CTA Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f6 100%)',
          border: '1px solid rgba(230, 0, 80, 0.2)',
          borderRadius: '20px',
          padding: '45px 35px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(230, 0, 80, 0.08)'
        }} data-aos="fade-up">
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>Ready to Elevate Your Wardrobe?</h3>
          <p style={{ color: '#4b5563', fontSize: '15.5px', maxWidth: '650px', margin: '0 auto 25px', lineHeight: '1.6' }}>Discover our latest festive arrivals, bridal ornaments, and adorable kids' collections with exclusive discounts today.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              background: 'linear-gradient(135deg, #e60050 0%, #ff1a6e 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '13px 32px',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(230, 0, 80, 0.35)'
            }}>
              <i className="fas fa-shopping-bag"></i> Explore Collections
            </Link>
            <Link href="/contact" style={{
              background: '#ffffff',
              color: '#111827',
              border: '1.5px solid #e5e7eb',
              textDecoration: 'none',
              padding: '13px 28px',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-envelope"></i> Contact Our Team
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
