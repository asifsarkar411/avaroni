'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

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
            alert("Thank you! Your message has been sent successfully. We will get back to you soon.");
            setFormData({ name: '', email: '', message: '' });
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
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(12px)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }} data-aos="fade-up">
            
            <div style={{ flex: '1', minWidth: '300px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}><i className="fas fa-envelope"></i> Get in Touch</h2>
                <p style={{ marginBottom: '20px', color: '#555' }}>Have questions about your order, our products, or our store? Send us a message or reach out directly.</p>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-map-marker-alt" style={{ fontSize: '20px', width: '30px' }}></i>
                    <span>Mirpur 2, Dhaka-1216 , Bangladesh</span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-phone-alt" style={{ fontSize: '20px', width: '30px' }}></i>
                    <span>01628628300</span>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-envelope" style={{ fontSize: '20px', width: '30px' }}></i>
                    <span>avaroni0000@gmail.com</span>
                </div>
            </div>

            <div style={{ flex: '1', minWidth: '300px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Name" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Your Email" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message</label>
                        <textarea rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="How can we help you?" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}></textarea>
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#111', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}
