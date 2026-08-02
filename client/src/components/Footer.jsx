import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
        <div className="footer-content">
            <div className="footer-section">
                <h3>AVARONI</h3>
                <p>Elegance Redefined for Every Moment.</p>
                <div className="social-links">
                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
            </div>
            <div className="footer-section">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="/women.html">Women</a></li>
                    <li><a href="/kids.html">Kids</a></li>
                    <li><a href="/ornament.html">Ornaments</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Customer Service</h3>
                <ul>
                    <li><a href="/track-order.html">Track Order</a></li>
                    <li><a href="/return-policy.html">Return Policy</a></li>
                    <li><Link href="/contact">Contact Us</Link></li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} AVARONI. All rights reserved.</p>
        </div>
    </footer>
  );
}
