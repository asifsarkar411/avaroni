export default function Sidebar({ isOpen, onClose }) {
  return (
    <div id="sidebar" className={'sidebar ' + (isOpen ? 'active' : '')}>
        <div className="sidebar-header">
            <a href="/" className="sidebar-brand">
                <img src="/img/profile_image.jpg" alt="Logo" className="sidebar-logo" />
                <span>AVARONI</span>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="close-btn">&times;</a>
        </div>
        <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '10px 0' }} />
        <a href="/track-order.html"><i className="fas fa-truck"></i> Track Order</a>
        <a href="/faq.html"><i className="fas fa-question-circle"></i> FAQ</a>
        <a href="/blog.html"><i className="fas fa-newspaper"></i> Blog</a>
        <a href="/sitemap.html"><i className="fas fa-sitemap"></i> Sitemap</a>
        <a href="/return-product.html"><i className="fas fa-undo"></i> Return Product</a>
        <a href="/return-policy.html"><i className="fas fa-file-contract"></i> Return Policy</a>
        <a href="/about.html"><i className="fas fa-info-circle"></i> About Us</a>
        <a href="/contact.html"><i className="fas fa-envelope"></i> Contact</a>
    </div>
  );
}
