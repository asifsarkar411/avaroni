import Link from 'next/link';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <div id="sidebar" className={'sidebar ' + (isOpen ? 'active' : '')}>
        <div className="sidebar-header">
            <Link href="/" className="sidebar-brand">
                <img src="/img/profile_image.jpg" alt="Logo" className="sidebar-logo" />
                <span>AVARONI</span>
            </Link>
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="close-btn">&times;</a>
        </div>
        <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '10px 0' }} />
        <Link href="/track-order"><i className="fas fa-truck"></i> Track Order</Link>
        <Link href="/faq"><i className="fas fa-question-circle"></i> FAQ</Link>
        <Link href="/blog"><i className="fas fa-newspaper"></i> Blog</Link>
        <Link href="/sitemap"><i className="fas fa-sitemap"></i> Sitemap</Link>
        <Link href="/return-product"><i className="fas fa-undo"></i> Return Product</Link>
        <Link href="/return-policy"><i className="fas fa-file-contract"></i> Return Policy</Link>
        <Link href="/about"><i className="fas fa-info-circle"></i> About Us</Link>
        <Link href="/contact"><i className="fas fa-envelope"></i> Contact</Link>
    </div>
  );
}
