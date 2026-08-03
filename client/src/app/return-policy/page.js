'use client';
import Link from 'next/link';

export default function ReturnPolicy() {
  return (
    <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(15px)', padding: '50px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }} data-aos="fade-up">
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '30px', color: '#111', letterSpacing: '-0.5px', textAlign: 'center' }}>
                <i className="fas fa-file-contract" style={{ color: '#ff4d4f', marginRight: '10px' }}></i>
                Return <span style={{ color: '#ff4d4f' }}>Policy</span>
            </h1>
            
            <div style={{ color: '#555', lineHeight: '1.8', fontSize: '1.05rem' }}>
                <div data-aos="fade-up" data-aos-delay="100" style={{ marginBottom: '30px', background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111', marginBottom: '10px' }}><i className="fas fa-undo-alt" style={{ color: '#ff4d4f', marginRight: '8px' }}></i> Returns Window</h3>
                    <p>We accept returns within <strong>7 days</strong> of the delivery date. Items must be unworn, unwashed, and in their original packaging with all tags attached.</p>
                </div>
                
                <div data-aos="fade-up" data-aos-delay="200" style={{ marginBottom: '30px', background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111', marginBottom: '10px' }}><i className="fas fa-ban" style={{ color: '#ff4d4f', marginRight: '8px' }}></i> Non-Returnable Items</h3>
                    <p>For hygiene reasons, innerwear, pierced jewellery, and cosmetics cannot be returned unless they arrive defective or damaged. Sale items are considered final sale.</p>
                </div>

                <div data-aos="fade-up" data-aos-delay="300" style={{ marginBottom: '30px', background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111', marginBottom: '10px' }}><i className="fas fa-wallet" style={{ color: '#ff4d4f', marginRight: '8px' }}></i> Refunds</h3>
                    <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed back to your original payment method within 5-7 business days.</p>
                </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }} data-aos="zoom-in" data-aos-delay="400">
                <Link href="/return-product" style={{ display: 'inline-block', padding: '12px 30px', background: 'linear-gradient(135deg, #ff4d4f, #ff7875)', color: '#fff', borderRadius: '50px', fontWeight: '700', textDecoration: 'none', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(255, 77, 79, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                    Initiate a Return
                </Link>
            </div>
        </div>
    </div>
  );
}
