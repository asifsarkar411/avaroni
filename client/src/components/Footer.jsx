import Link from 'next/link';

export default function Footer() {
  return (
    <>
    <footer className="site-footer">
        <div className="footer-container">
            <div className="footer-section">
                <h3>AVARONI</h3>
                <p>Elegance Redefined for Every Moment.</p>
                <div className="social-icons">
                    <a href="#" className="social-facebook"><i className="fab fa-facebook-f"></i></a>
                    <a href="#" className="social-twitter"><i className="fab fa-twitter"></i></a>
                    <a href="#" className="social-instagram"><i className="fab fa-instagram"></i></a>
                </div>
            </div>
            <div className="footer-section">
                <h3>Quick Links</h3>
                <ul>
                    <li><Link href="/category/women" prefetch={false}>Women</Link></li>
                    <li><Link href="/category/kids" prefetch={false}>Kids</Link></li>
                    <li><Link href="/category/ornament" prefetch={false}>Ornaments</Link></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Customer Service</h3>
                <ul>
                    <li><a href="/track-order">Track Order</a></li>
                    <li><a href="/return-policy">Return Policy</a></li>
                    <li><Link href="/contact">Contact Us</Link></li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom" style={{ textAlign: 'center', padding: '20px', color: '#777', fontSize: '14px' }}>
            <p>&copy; {new Date().getFullYear()} AVARONI. All rights reserved.</p>
            <p style={{ marginTop: '5px' }}>
                <a href="https://port-v-eno-m.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#777', textDecoration: 'underline' }}>
                    Developed By "SM FERDOUS AHMMED"
                </a>
            </p>
        </div>
    </footer>

    {/* Floating Action Buttons */}
    <div className="floating-actions">
        <a href="tel:+8801234567890" className="floating-btn phone" title="Call Us">
            <i className="fas fa-phone-alt"></i>
        </a>
        <a href="https://wa.me/8801234567890" target="_blank" rel="noopener noreferrer" className="floating-btn whatsapp" title="WhatsApp Us">
            <i className="fab fa-whatsapp"></i>
        </a>
        <a href="https://m.me/avaroni" target="_blank" rel="noopener noreferrer" className="floating-btn messenger" title="Message Us">
            <i className="fab fa-facebook-messenger"></i>
        </a>
    </div>
    </>
  );
}
