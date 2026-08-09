'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getImageUrl } from '@/utils/image';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const [shippingDetails, setShippingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryLocation: 'inside', // 'inside' or 'outside'
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [transactionId, setTransactionId] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activePromos, setActivePromos] = useState([]);

    const shippingFee = shippingDetails.deliveryLocation === 'inside' ? 80 : 150;
    const finalTotal = Math.max(0, cartTotal + shippingFee - discount);

    useEffect(() => {
        if (orderPlaced && placedOrderDetails) {
            clearCart();
        }
    }, [orderPlaced]);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await fetch('/api/promocodes/active');
                const data = await res.json();
                if (data.success && data.promos) {
                    setActivePromos(data.promos);
                }
            } catch (err) {
                console.error('Failed to fetch active promos', err);
            }
        };
        fetchPromos();
    }, []);

    const handleApplyPromo = async (codeToApply) => {
        const code = (typeof codeToApply === 'string' ? codeToApply : promoCode).trim();
        if (!code) {
            setPromoMessage('Please enter a promo code');
            return;
        }
        if (typeof codeToApply === 'string') {
            setPromoCode(code);
        }
        
        try {
            const res = await fetch('/api/promocodes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, cartTotal })
            });
            const data = await res.json();
            
            if (data.success) {
                let calculatedDiscount = 0;
                if (data.discountType === 'percentage') {
                    calculatedDiscount = cartTotal * (data.discountValue / 100);
                } else {
                    calculatedDiscount = data.discountValue;
                }
                setDiscount(calculatedDiscount);
                setPromoMessage(`Promo applied! You saved BDT ${calculatedDiscount}`);
            } else {
                setDiscount(0);
                setPromoMessage(data.message || 'Invalid promo code');
            }
        } catch (error) {
            console.error('Error applying promo:', error);
            setPromoMessage('Failed to validate promo code');
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        if (paymentMethod === 'bkash' && !transactionId.trim()) {
            alert('Please enter your bKash Transaction ID');
            return;
        }

        setIsSubmitting(true);

        const orderData = {
            name: shippingDetails.name,
            email: shippingDetails.email,
            phone: shippingDetails.phone,
            address: shippingDetails.address,
            deliveryLocation: shippingDetails.deliveryLocation,
            cartItems: cart,
            totalAmount: finalTotal,
            shippingFee: shippingFee,
            discountAmount: discount,
            promoCode: discount > 0 ? promoCode : '',
            paymentMethod,
            trxId: paymentMethod === 'bkash' ? transactionId : ''
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            
            if (data.success) {
                setPlacedOrderDetails(data.order);
                setOrderPlaced(true);
            } else {
                alert(data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadInvoice = () => {
        if (!placedOrderDetails) return;
        
        // Use the old logic or just a simplified React one
        // For now, we will open a new window to print the invoice since it's the most responsive way
        const orderDate = new Date(placedOrderDetails.orderDate || Date.now()).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        let itemsHtml = '';
        placedOrderDetails.cartItems.forEach((item, index) => {
            itemsHtml += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${index + 1}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">BDT ${item.price}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">BDT ${item.price * item.quantity}</td>
                </tr>
            `;
        });

        const invoiceHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice - ${placedOrderDetails.orderNumber}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 30px; color: #333; background: #fff; }
                    .invoice-container { max-width: 700px; margin: 0 auto; }
                    .invoice-header { display: flex; justify-content: space-between; border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th { background: #f8f9fa; padding: 10px; text-align: left; }
                    .totals-section { display: flex; justify-content: flex-end; }
                    .row { display: flex; justify-content: space-between; padding: 6px 0; width: 250px; }
                    .row.total { border-top: 2px solid #111; font-weight: bold; font-size: 1.2rem; margin-top: 10px; padding-top: 10px;}
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="invoice-header">
                        <div>
                            <h1 style="margin: 0; color: #111;">আভরণী (AVARONI)</h1>
                            <p style="margin: 5px 0; color: #666;">Your one-stop shop for fashion and beauty</p>
                        </div>
                        <div style="text-align: right;">
                            <h2 style="margin: 0;">INVOICE</h2>
                            <p><strong>Order:</strong> ${placedOrderDetails.orderNumber}</p>
                            <p><strong>Date:</strong> ${orderDate}</p>
                            <p><strong>Payment:</strong> ${placedOrderDetails.paymentMethod}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h3>Billed To:</h3>
                        <p style="margin: 3px 0;"><strong>${placedOrderDetails.customerName}</strong></p>
                        <p style="margin: 3px 0;">${placedOrderDetails.phone}</p>
                        <p style="margin: 3px 0;">${placedOrderDetails.email}</p>
                        <p style="margin: 3px 0;">${placedOrderDetails.address}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>

                    <div class="totals-section">
                        <div>
                            <div class="row"><span>Subtotal:</span><span>BDT ${cartTotal}</span></div>
                            <div class="row"><span>Delivery:</span><span>BDT ${placedOrderDetails.shippingFee}</span></div>
                            ${discount > 0 ? `<div class="row" style="color: #28a745;"><span>Discount:</span><span>-BDT ${discount}</span></div>` : ''}
                            <div class="row total"><span>Total:</span><span>BDT ${placedOrderDetails.totalAmount}</span></div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 50px; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                        Thank you for your purchase! This is a computer-generated invoice.
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    if (orderPlaced) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#28a745', marginBottom: '20px' }}></i>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Order Confirmed!</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                        Thank you for your purchase. Your order number is <strong>{placedOrderDetails?.orderNumber}</strong>. We'll be processing it shortly.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={downloadInvoice} className="btn" style={{ background: '#111', flex: '1', minWidth: '200px' }}>
                            <i className="fas fa-file-invoice" style={{ marginRight: '8px' }}></i> Download Invoice
                        </button>
                        <Link href="/" className="btn" style={{ background: '#fff', color: '#111', border: '2px solid #111', flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-home" style={{ marginRight: '8px' }}></i> Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
                <i className="fas fa-shopping-bag" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
                <h2>Your cart is empty</h2>
                <Link href="/" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="page-title" style={{ textAlign: 'center', margin: '30px 0', fontSize: '2rem' }}>Secure Checkout</h2>
            
            <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                
                {/* LEFT: Shipping Details */}
                <div>
                    <div style={{ background: 'rgba(255,255,255,0.85)', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}><i className="fas fa-truck"></i> Shipping Details</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Full Name" required value={shippingDetails.name} onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            <input type="email" placeholder="Email Address" required value={shippingDetails.email} onChange={e => setShippingDetails({...shippingDetails, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            <input type="tel" placeholder="Phone Number" required value={shippingDetails.phone} onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }} />
                            <textarea placeholder="Full Delivery Address" required rows="3" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', resize: 'vertical' }}></textarea>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Delivery Area</label>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input type="radio" name="deliveryLocation" value="inside" checked={shippingDetails.deliveryLocation === 'inside'} onChange={() => setShippingDetails({...shippingDetails, deliveryLocation: 'inside'})} />
                                        Inside Dhaka (BDT 80)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input type="radio" name="deliveryLocation" value="outside" checked={shippingDetails.deliveryLocation === 'outside'} onChange={() => setShippingDetails({...shippingDetails, deliveryLocation: 'outside'})} />
                                        Outside Dhaka (BDT 150)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.85)', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}><i className="fas fa-wallet"></i> Payment Method</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', border: paymentMethod === 'cod' ? '2px solid #111' : '1px solid #eee', borderRadius: '8px' }}>
                                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                                <strong>Cash on Delivery</strong>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', border: paymentMethod === 'bkash' ? '2px solid #e2136e' : '1px solid #eee', borderRadius: '8px' }}>
                                <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} />
                                <strong>bKash</strong>
                            </label>
                            
                            {paymentMethod === 'bkash' && (
                                <div style={{ background: '#fdf2f8', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #e2136e', textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>Send total bill via bKash to:</p>
                                    <h3 style={{ color: '#e2136e', margin: '0 0 10px' }}>01628628300</h3>
                                    <input type="text" placeholder="Enter TrxID here" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required style={{ width: '100%', padding: '10px', textAlign: 'center', border: '2px solid #e2136e', borderRadius: '8px' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Order Summary */}
                <div>
                    <div style={{ background: 'rgba(255,255,255,0.85)', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Order Summary</h3>
                        
                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                            {cart.map(item => (
                                <div key={item._id} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <img src={getImageUrl(item.imageUrl)} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Qty: {item.quantity} x BDT {item.price}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>BDT {item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="text" placeholder="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            <button type="button" onClick={handleApplyPromo} className="btn" style={{ background: '#333', padding: '10px 20px' }}>Apply</button>
                        </div>
                        {activePromos.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>Available Promos:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activePromos.map(promo => (
                                        <div 
                                            key={promo._id} 
                                            onClick={() => handleApplyPromo(promo.code)}
                                            style={{ padding: '8px 12px', background: '#f8f9fa', border: '1px dashed #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <div>
                                                <strong>{promo.code}</strong> - {promo.minOrderAmount > 0 ? `Shop for ৳${promo.minOrderAmount} or more to get ` : 'Get '}{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `৳${promo.discountValue}`} discount!
                                            </div>
                                            <span style={{ color: '#007bff', fontWeight: '500' }}>Apply</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {promoMessage && <div style={{ color: discount > 0 ? '#28a745' : '#e60050', fontSize: '0.85rem', marginBottom: '15px' }}>{promoMessage}</div>}

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                                <span>Subtotal</span>
                                <span>BDT {cartTotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                                <span>Delivery Fee</span>
                                <span>BDT {shippingFee}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#28a745' }}>
                                    <span>Discount</span>
                                    <span>- BDT {discount}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #111', fontWeight: 'bold', fontSize: '1.3rem' }}>
                                <span>Total</span>
                                <span>BDT {finalTotal}</span>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn" style={{ width: '100%', marginTop: '25px', padding: '15px', fontSize: '1.1rem', background: isSubmitting ? '#666' : '#111' }}>
                            {isSubmitting ? 'Processing...' : <><i className="fas fa-lock"></i> Place Order</>}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}
