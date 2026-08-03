'use client';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/utils/image';
import Link from 'next/link';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', minHeight: '60vh' }}>
            <h2 className="page-title" style={{ textAlign: 'center', margin: '40px 0 20px', color: '#111', fontSize: '2rem', fontWeight: '600' }}>
                <i className="fas fa-shopping-bag"></i> Shopping Cart
            </h2>
            
            <div className="cart-container" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
                
                {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                        <i className="fas fa-shopping-cart" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ccc' }}></i>
                        <h3>Your cart is empty</h3>
                        <Link href="/" className="btn" style={{ display: 'inline-block', marginTop: '15px' }}>Continue Shopping</Link>
                    </div>
                ) : (
                    <>
                        <div id="cart-items" style={{ marginBottom: '30px' }}>
                            {cart.map(item => (
                                <div key={item._id} className="cart-item" style={{ display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', gap: '15px' }}>
                                    <img src={getImageUrl(item.imageUrl)} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                    
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#111' }}>{item.name}</h4>
                                        <div style={{ color: '#666', fontSize: '0.9rem' }}>BDT {item.price}</div>
                                    </div>

                                    <div className="cart-quantity-controls" style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
                                        <button onClick={() => updateQuantity(item._id, -1)} style={{ border: 'none', background: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}>-</button>
                                        <span style={{ padding: '0 10px', fontWeight: 'bold' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, 1)} style={{ border: 'none', background: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}>+</button>
                                    </div>

                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                                        BDT {item.price * item.quantity}
                                    </div>

                                    <button onClick={() => removeFromCart(item._id)} style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '1.2rem', padding: '10px' }} title="Remove Item">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-price-summary" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.1rem' }}>
                                <span>Subtotal</span>
                                <span>BDT {cartTotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '1.3rem', fontWeight: 'bold', color: '#111' }}>
                                <span>Estimated Total</span>
                                <span>BDT {cartTotal}</span>
                            </div>

                            <Link href="/checkout" className="btn" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '20px', padding: '15px', fontSize: '1.1rem' }}>
                                Proceed to Checkout
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
