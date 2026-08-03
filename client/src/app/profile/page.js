'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { getImageUrl } from '@/utils/image';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, token, loading, login, logout } = useAuth();
    const { wishlist, removeFromWishlist } = useWishlist();
    
    // Auth Form State
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // Dashboard State
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, wishlist

    useEffect(() => {
        if (user && token && activeTab === 'orders') {
            fetchOrders();
        }
    }, [user, token, activeTab]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch('/api/user/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            const url = isLogin ? '/api/user/auth/login' : '/api/user/auth/register';
            const body = isLogin 
                ? { identifier, password }
                : { name, identifier, password };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                login(data.user, data.token);
            } else {
                setAuthError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setAuthError('Network error. Please try again later.');
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) {
        return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return (
            <div style={{ padding: '40px 20px', minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#111' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    
                    {authError && <div style={{ padding: '10px', background: '#ffe8e8', color: '#dc3545', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{authError}</div>}
                    
                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {!isLogin && (
                            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                        )}
                        
                        <input type="text" placeholder="Email or Phone" value={identifier} onChange={e => setIdentifier(e.target.value)} required style={inputStyle} />
                        
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
                        
                        <button type="submit" className="btn" disabled={authLoading} style={{ marginTop: '10px', width: '100%', padding: '12px' }}>
                            {authLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>
                    
                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={() => { setIsLogin(!isLogin); setAuthError(''); }} style={{ color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold' }}>
                            {isLogin ? 'Register here' : 'Login here'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', minHeight: '70vh', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                
                {/* Sidebar Navigation */}
                <div style={{ flex: '1', minWidth: '250px', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff4d4f, #ff7875)', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', margin: '0 auto 15px', fontWeight: 'bold' }}>
                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#111' }}>{user.username || 'Customer'}</h3>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{user.email || user.phone}</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={() => setActiveTab('profile')} style={tabStyle(activeTab === 'profile')}><i className="far fa-user" style={{ width: '25px' }}></i> My Profile</button>
                        <button onClick={() => setActiveTab('orders')} style={tabStyle(activeTab === 'orders')}><i className="fas fa-box-open" style={{ width: '25px' }}></i> Purchase History</button>
                        <button onClick={() => setActiveTab('wishlist')} style={tabStyle(activeTab === 'wishlist')}><i className="far fa-heart" style={{ width: '25px' }}></i> My Wishlist ({wishlist.length})</button>
                        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
                        <button onClick={logout} style={{ ...tabStyle(false), color: '#dc3545' }}><i className="fas fa-sign-out-alt" style={{ width: '25px' }}></i> Logout</button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: '3', minWidth: '300px', background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    
                    {activeTab === 'profile' && (
                        <div>
                            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px', color: '#111' }}>Account Details</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '5px' }}>Full Name</label>
                                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{user.username || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '5px' }}>Email Address</label>
                                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{user.email || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '5px' }}>Phone Number</label>
                                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{user.phone || '-'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px', color: '#111' }}>Purchase History</h2>
                            {ordersLoading ? (
                                <p style={{ color: '#666' }}>Loading orders...</p>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                                    <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '15px' }}></i>
                                    <p>You haven't placed any orders yet.</p>
                                    <Link href="/" className="btn" style={{ marginTop: '15px' }}>Start Shopping</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {orders.map(order => (
                                        <div key={order._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f5f5f5' }}>
                                                <div>
                                                    <span style={{ fontWeight: 'bold', color: '#111' }}>{order.orderNumber}</span>
                                                    <span style={{ display: 'block', fontSize: '13px', color: '#888' }}>{new Date(order.orderDate).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>BDT {order.totalAmount}</span>
                                                    <span style={{ display: 'block', fontSize: '13px', color: '#888', textTransform: 'capitalize' }}>Status: {order.status}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#555' }}><strong>Items:</strong></p>
                                                <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {order.cartItems.map((item, idx) => (
                                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                                            <img src={getImageUrl(item.image || item.imageUrl)} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                            <span style={{ flex: 1 }}>{item.name}</span>
                                                            <span style={{ color: '#666' }}>x{item.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div>
                            <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px', color: '#111' }}>My Wishlist</h2>
                            {wishlist.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                                    <i className="far fa-heart" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '15px' }}></i>
                                    <p>Your wishlist is currently empty.</p>
                                    <Link href="/" className="btn" style={{ marginTop: '15px' }}>Explore Products</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {wishlist.map(prod => (
                                        <div key={prod._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', position: 'relative', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => removeFromWishlist(prod._id)} 
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: '1px solid #eee', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#ff4d4f' }}
                                                title="Remove"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                            <Link href={`/product/${prod.slug || prod._id}`}>
                                                <img src={getImageUrl(prod.imageUrl)} alt={prod.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{prod.name}</h4>
                                                <div style={{ fontWeight: 'bold', color: '#111' }}>BDT {prod.price}</div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// Inline Styles for Dashboard
const inputStyle = {
    padding: '12px 15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '15px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const tabStyle = (isActive) => ({
    padding: '12px 15px',
    background: isActive ? '#f8f9fa' : 'transparent',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#ff4d4f' : '#555',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
});
