'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ReturnProduct() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ orderId: '', email: '', reason: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        alert("Return request submitted successfully! Our team will contact you within 24 hours with instructions.");
        setFormData({ orderId: '', email: '', reason: '' });
        setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(15px)', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }} data-aos="fade-up">
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '10px', color: '#111', letterSpacing: '-0.5px', textAlign: 'center' }}>
                <i className="fas fa-undo" style={{ color: '#ff4d4f', marginRight: '10px' }}></i>
                Return a <span style={{ color: '#ff4d4f' }}>Product</span>
            </h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Please fill out the form below to initiate your return request.</p>

            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Order ID</label>
                    <input type="text" value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})} placeholder="e.g., AV-12345" required style={{ width: '100%', padding: '12px 15px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', background: '#fafafa', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = '#ff4d4f'} onBlur={e => e.target.style.borderColor = '#eee'} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Email Address used for Order</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" required style={{ width: '100%', padding: '12px 15px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', background: '#fafafa', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = '#ff4d4f'} onBlur={e => e.target.style.borderColor = '#eee'} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Reason for Return</label>
                    <textarea rows="4" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Please briefly explain why you are returning this item..." required style={{ width: '100%', padding: '12px 15px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', background: '#fafafa', resize: 'vertical', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = '#ff4d4f'} onBlur={e => e.target.style.borderColor = '#eee'}></textarea>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff4d4f, #ff7875)', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '1.05rem', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(255, 77, 79, 0.3)', opacity: loading ? 0.7 : 1 }} onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                    {loading ? (<span><i className="fas fa-spinner fa-spin"></i> Processing...</span>) : "Submit Return Request"}
                </button>
            </form>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                 <Link href="/return-policy" style={{ color: '#ff4d4f', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>Read our full Return Policy <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem', marginLeft: '5px' }}></i></Link>
            </div>
        </div>
    </div>
  );
}
