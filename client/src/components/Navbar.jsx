export default function Navbar({ onMenuClick }) {
  return (
    <nav className="navbar">
        <a href="/" className="logo">
            <img src="/img/profile_image.jpg" alt="Logo" className="nav-logo" />
            <b>AVARONI</b>
        </a>
        <div className="search-bar-container">
            <div className="search-bar-inner">
                <div className="search-input-wrap">
                    <i className="fas fa-search search-bar-icon"></i>
                    <input type="text" id="global-search-input" placeholder="Search for products..." autoComplete="off" />
                </div>
            </div>
        </div>
        <div className="nav-links">
            <a href="/wishlist.html" className="wishlist-icon" title="Wishlist"><i className="far fa-heart"></i><span className="wishlist-badge">0</span></a>
            <i onClick={onMenuClick} className="fas fa-bars menu-icon" style={{cursor: 'pointer', fontSize: '24px', marginLeft: '15px', color: '#333'}}></i>
        </div>
    </nav>
  );
}
