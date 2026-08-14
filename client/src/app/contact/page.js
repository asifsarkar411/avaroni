'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', subject: 'General Inquiry', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.ok && data.success) {
            setSentSuccess(true);
            setFormData({ name: '', phone: '', email: '', subject: 'General Inquiry', message: '' });
            setTimeout(() => setSentSuccess(false), 8000);
        } else {
            alert(data.message || "Failed to send message.");
        }
    } catch (err) {
        console.error("Contact submission error:", err);
        alert("An error occurred. Please check your internet connection.");
    } finally {
        setLoading(false);
    }
  };

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
          <i className="fas fa-headset"></i> We're Here For You
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          marginBottom: '15px',
          lineHeight: '1.2'
        }} data-aos="fade-up">
          Get in Touch with <span style={{
            background: 'linear-gradient(135deg, #ff4d88 0%, #ff80aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>AVARONI</span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: '#d1d5db',
          maxWidth: '750px',
          margin: '0 auto 20px',
          lineHeight: '1.6'
        }} data-aos="fade-up" data-aos-delay="100">
          Have questions about your order, sizing, payment methods, or custom inquiries? Our friendly support team is always ready to assist you.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#9ca3af' }} data-aos="fade-up" data-aos-delay="200">
          <Link href="/" style={{ color: '#d1d5db', textDecoration: 'none' }}><i className="fas fa-home"></i> Home</Link>
          <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: '#6b7280' }}></i>
          <span>Contact Us</span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', margin: '-30px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          
          {/* Left Info Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '35px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} data-aos="fade-right">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                <i className="fas fa-paper-plane" style={{ color: '#e60050', fontSize: '20px', marginRight: '6px' }}></i> Direct Support Channels
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '25px' }}>
                Choose your preferred channel below or send us a message through the form.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
                <a href="https://wa.me/8801628628300" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '14px', background: '#fdf2f6', border: '1px solid rgba(230, 0, 80, 0.1)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '3px' }}>WhatsApp Instant Chat</h4>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>+880 1628628300</p>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Online • Instant Reply</span>
                  </div>
                </a>

                <a href="tel:+8801628628300" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '14px', background: '#fdf2f6', border: '1px solid rgba(230, 0, 80, 0.1)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '3px' }}>Phone Support</h4>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>01628628300</p>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>9:00 AM - 10:00 PM Daily</span>
                  </div>
                </a>

                <a href="mailto:avaroni0000@gmail.com" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '14px', background: '#fdf2f6', border: '1px solid rgba(230, 0, 80, 0.1)', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #e60050, #990035)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '3px' }}>Official Email</h4>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>avaroni0000@gmail.com</p>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Response within 2-4 hours</span>
                  </div>
                </a>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '14px', background: '#fdf2f6', border: '1px solid rgba(230, 0, 80, 0.1)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '3px' }}>Store & Dispatch Office</h4>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>Mirpur 2, Dhaka-1216, Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #111111 0%, #1f1f1f 100%)', color: '#ffffff', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
              <h4 style={{ color: '#ff80aa', fontSize: '15px', marginBottom: '6px' }}><i className="fas fa-bolt"></i> Need Immediate Help?</h4>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>Track your package live or check answers to our most frequent questions.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <a href="/track-order.html" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Track Order</a>
                <a href="/faq.html" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>View FAQ</a>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.06)' }} data-aos="fade-left">
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Send Us a Message</h2>
            <p style={{ color: '#6b7280', fontSize: '14.5px', marginBottom: '25px' }}>Fill out the details below and our team will get back to you promptly.</p>

            {sentSuccess && (
              <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', color: '#065f46', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14.5px' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '22px' }}></i>
                <div><strong>Thank you!</strong> Your message has been sent successfully. We will get back to you shortly.</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Your Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sadia Islam" required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '14.5px', outline: 'none', background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Phone Number *</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 017xxxxxxxx" required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '14.5px', outline: 'none', background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Email Address *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. you@example.com" required style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '14.5px', outline: 'none', background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Inquiry Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '14.5px', outline: 'none', background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }}>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Status / Tracking">Order Status / Tracking</option>
                    <option value="Product & Sizing Help">Product & Sizing Help</option>
                    <option value="Return / Exchange Request">Return / Exchange Request</option>
                    <option value="Wholesale / Partnership">Wholesale / Partnership</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '700', color: '#374151', marginBottom: '7px' }}>Your Message / Questions *</label>
                <textarea rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Please describe how we can assist you in detail..." required style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', fontSize: '14.5px', outline: 'none', background: '#f9fafb', color: '#111827', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #e60050 0%, #ff1a6e 100%)', color: '#ffffff', border: 'none', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(230, 0, 80, 0.35)' }}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Message</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
