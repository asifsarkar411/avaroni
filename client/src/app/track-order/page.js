'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    const doTrackOrder = async (idToTrack) => {
        const cleanId = (idToTrack || '').trim();
        if (!cleanId) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const res = await fetch(`/api/orders/track/${encodeURIComponent(cleanId)}`);
            const data = await res.json();
            if (res.ok && data.success && data.order) {
                setOrder(data.order);
            } else {
                setError(data.message || 'No order found with this reference. Please verify your Order Number.');
            }
        } catch (err) {
            console.error('Track order error:', err);
            setError('Unable to fetch order status. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryId = searchParams.get('orderId') || searchParams.get('orderNumber');
        if (queryId) {
            setOrderId(queryId);
            doTrackOrder(queryId);
        }
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        doTrackOrder(orderId);
    };

    const status = (order?.status || 'pending').toLowerCase();
    let stepNumber = 1;
    if (status === 'approved') stepNumber = 2;
    else if (status === 'processing' || status === 'shipped') stepNumber = 3;
    else if (status === 'delivered') stepNumber = 4;
    else if (status === 'cancelled') stepNumber = 0;

    return (
        <div style={{ background: '#f5f5f7', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #111111 0%, #1f1f1f 50%, #2a111e 100%)',
                color: '#ffffff',
                padding: '65px 20px 55px',
                textAlign: 'center',
                borderBottom: '3px solid rgba(230, 0, 80, 0.3)'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(230, 0, 80, 0.2)',
                    color: '#ff80aa',
                    border: '1px solid rgba(230, 0, 80, 0.4)',
                    padding: '6px 18px',
                    borderRadius: '30px',
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    marginBottom: '18px'
                }}>
                    <i className="fas fa-truck-fast"></i> Real-Time Shipment Tracker
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>
                    Track Your <span style={{ color: '#ff80aa' }}>Order</span>
                </h1>
                <p style={{ color: '#d1d5db', maxWidth: '650px', margin: '0 auto 25px', lineHeight: '1.6' }}>
                    Enter your Order ID (e.g., <strong style={{ color: '#ffffff' }}>ORD-123456</strong>) below to check live shipping status and delivery updates across all 64 districts in Bangladesh.
                </p>

                {/* Track Search Box */}
                <form onSubmit={handleSubmit} style={{
                    maxWidth: '580px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    padding: '8px',
                    borderRadius: '50px',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '15px', color: '#ffffff' }}>
                        <i className="fas fa-search" style={{ marginRight: '10px', color: '#ff80aa' }}></i>
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter Order ID (e.g. ORD-1778...)"
                            required
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#ffffff',
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #e60050 0%, #ff4d88 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 28px',
                            borderRadius: '30px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                        <span>{loading ? 'Tracking...' : 'Track Now'}</span>
                    </button>
                </form>
            </div>

            {/* Main Result Section */}
            <div style={{ maxWidth: '850px', margin: '30px auto 0', padding: '0 20px' }}>
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #f87171',
                        borderRadius: '12px',
                        padding: '20px',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        marginBottom: '25px'
                    }}>
                        <i className="fas fa-exclamation-triangle" style={{ fontSize: '24px' }}></i>
                        <div>
                            <h4 style={{ margin: '0 0 4px', fontWeight: '700' }}>Order Not Found</h4>
                            <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
                        </div>
                    </div>
                )}

                {order && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        marginBottom: '30px'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '15px'
                        }}>
                            <div>
                                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>Order Tracking Summary</span>
                                <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                                    #{order.orderNumber || order._id}
                                </h3>
                            </div>
                            <div>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 16px',
                                    borderRadius: '30px',
                                    fontWeight: '800',
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    background: status === 'delivered' ? '#dcfce7' : status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                    color: status === 'delivered' ? '#166534' : status === 'cancelled' ? '#991b1b' : '#92400e'
                                }}>
                                    {order.status || 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div style={{ padding: '30px 24px', background: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                                {[
                                    { step: 1, icon: 'fa-clipboard-check', label: 'Placed' },
                                    { step: 2, icon: 'fa-check-circle', label: 'Approved' },
                                    { step: 3, icon: 'fa-box', label: 'Processing' },
                                    { step: 4, icon: 'fa-truck-ramp-box', label: 'Delivered' }
                                ].map((s) => {
                                    const isDone = stepNumber >= s.step;
                                    return (
                                        <div key={s.step} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                                            <div style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '50%',
                                                background: isDone ? '#e60050' : '#e5e7eb',
                                                color: isDone ? '#ffffff' : '#9ca3af',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 8px',
                                                fontWeight: '700',
                                                fontSize: '16px',
                                                transition: 'all 0.3s'
                                            }}>
                                                <i className={`fas ${s.icon}`}></i>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: isDone ? '#111827' : '#9ca3af' }}>
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Details & Customer Info */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Customer</span>
                                    <p style={{ margin: '4px 0 0', fontWeight: '700', color: '#111827' }}>{order.customerName || 'Customer'}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#4b5563' }}>{order.phone || ''}</p>
                                </div>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Payment</span>
                                    <p style={{ margin: '4px 0 0', fontWeight: '700', color: '#111827' }}>
                                        {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'bKash / Mobile Payment'}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#4b5563' }}>Total: BDT {order.totalAmount || 0}</p>
                                </div>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Delivery Address</span>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#111827', fontWeight: '600' }}>{order.address || 'Standard Delivery'}</p>
                                </div>
                            </div>

                            {/* Items List */}
                            <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Ordered Items</h4>
                            <div style={{ border: '1px solid #f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                                {(order.cartItems || []).map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        borderBottom: idx === (order.cartItems.length - 1) ? 'none' : '1px solid #f3f4f6'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img
                                                src={item.image || '/img/profile_image.jpg'}
                                                alt={item.name}
                                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                                                onError={(e) => { e.target.src = '/img/profile_image.jpg'; }}
                                            />
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>{item.name}</h5>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''} {item.color ? `| Color: ${item.color}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '700', color: '#e60050', fontSize: '14px' }}>
                                            BDT {(item.price || 0) * (item.quantity || 1)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <Link
                                    href={`/invoice.html?orderNumber=${encodeURIComponent(order.orderNumber || order._id)}`}
                                    target="_blank"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '10px 20px',
                                        background: '#111827',
                                        color: '#ffffff',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <i className="fas fa-file-invoice"></i> Download Invoice
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin fa-2x"></i></div>}>
            <TrackOrderContent />
        </Suspense>
    );
}
