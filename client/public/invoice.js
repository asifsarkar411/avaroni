// ==========================================
// DOWNLOADABLE INVOICE GENERATOR (Robust Flexbox Layout)
// ==========================================

async function generatePDFInvoice(order) {
    if (!order) return;
    
    const orderDate = new Date(order.orderDate || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    let itemsHtml = '';
    let subtotal = 0;
    
    const cartItems = order.cartItems || [];
    cartItems.forEach((item, index) => {
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        const itemTotal = price * quantity;
        subtotal += itemTotal;
        itemsHtml += `
            <tr>
                <td style="padding: 16px 15px; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${String(index + 1).padStart(2, '0')}</td>
                <td style="padding: 16px 15px; font-size: 15px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
                <td style="padding: 16px 15px; text-align: center; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${quantity}</td>
                <td style="padding: 16px 15px; text-align: right; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">৳${price.toLocaleString()}</td>
                <td style="padding: 16px 15px; text-align: right; font-size: 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #e2e8f0;">৳${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });

    const discount = order.discountAmount !== undefined ? Number(order.discountAmount) : 0;
    const delivery = order.shippingFee !== undefined ? Number(order.shippingFee) : (order.totalAmount - subtotal + discount > 0 ? order.totalAmount - subtotal + discount : 0);
    
    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('cancel') || s.includes('reject')) return 'background: rgba(220, 38, 38, 0.1); color: #b91c1c;';
        if (s.includes('pending')) return 'background: rgba(245, 158, 11, 0.1); color: #b45309;';
        return 'background: rgba(46, 125, 50, 0.1); color: #2e7d32;';
    };

    const invoiceHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%; max-width: 800px; margin: 0 auto; background: #ffffff; color: #1e293b; position: relative;">
            
            <!-- Top Gradient Bar -->
            <div style="height: 8px; width: 100%; background: linear-gradient(90deg, #0f172a, #d4af37, #0f172a);"></div>

            <div style="padding: 50px;">
                <!-- Header Section -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                    <div>
                        <h1 style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0f172a;">AVARONI</h1>
                        <p style="margin: 5px 0 0; font-size: 12px; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase;">Premium Fashion & Beauty</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0 0 10px; font-size: 32px; font-weight: 300; letter-spacing: 3px; color: #0f172a;">INVOICE</h2>
                        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Order No: <strong style="color: #1e293b; font-weight: 600;">${order.orderNumber}</strong></p>
                        <p style="margin: 5px 0; font-size: 14px; color: #64748b;">Date: <strong style="color: #1e293b; font-weight: 600;">${orderDate}</strong></p>
                    </div>
                </div>

                <!-- Customer & Payment Details (Flexbox for html2canvas compatibility) -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="flex: 1;">
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 15px; font-weight: 600;">Billed To</div>
                        <div style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 10px;">${order.customerName}</div>
                        <div style="font-size: 14px; color: #1e293b; margin-bottom: 8px;">📞 ${order.phone}</div>
                        <div style="font-size: 14px; color: #1e293b; margin-bottom: 8px;">✉️ ${order.email || 'N/A'}</div>
                        <div style="font-size: 14px; color: #475569; margin-top: 10px; max-width: 250px; line-height: 1.5;">📍 ${order.address}</div>
                    </div>
                    <div style="flex: 1; text-align: right;">
                        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 15px; font-weight: 600;">Payment Information</div>
                        <div style="font-size: 14px; color: #1e293b; margin-bottom: 8px;"><strong>Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</div>
                        <div style="font-size: 14px; color: #1e293b; margin-bottom: 15px;"><strong>TrxID:</strong> ${order.transactionId || 'N/A'}</div>
                        <div style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; ${getStatusStyle(order.status)}">${order.status || 'Pending'}</div>
                    </div>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                    <thead>
                        <tr>
                            <th style="background: #0f172a; color: #ffffff; padding: 16px; text-align: left; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">#</th>
                            <th style="background: #0f172a; color: #ffffff; padding: 16px; text-align: left; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Item Description</th>
                            <th style="background: #0f172a; color: #ffffff; padding: 16px; text-align: center; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                            <th style="background: #0f172a; color: #ffffff; padding: 16px; text-align: right; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                            <th style="background: #0f172a; color: #ffffff; padding: 16px; text-align: right; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Totals Section -->
                <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
                    <div style="width: 350px; background: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #64748b;">
                            <span>Subtotal</span>
                            <strong style="color: #1e293b;">৳${subtotal.toLocaleString()}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #64748b;">
                            <span>Delivery Fee</span>
                            <strong style="color: #1e293b;">৳${delivery.toLocaleString()}</strong>
                        </div>
                        ${discount > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #10b981;">
                            <span>Discount ${order.promoCode ? `(${order.promoCode})` : ''}</span>
                            <strong>-৳${discount.toLocaleString()}</strong>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
                            <span style="font-size: 16px; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">Grand Total</span>
                            <span style="font-size: 24px; font-weight: 700; color: #0f172a;">৳${Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 30px; background: #0f172a; color: #ffffff;">
                <div style="font-size: 18px; font-weight: 500; margin: 0 0 10px; letter-spacing: 1px;">Thank you for your business!</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin: 5px 0;">This is a computer-generated invoice and does not require a physical signature.</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin: 5px 0;">For any inquiries, please contact us at support@avaroni.com</div>
            </div>
        </div>
    `;

    try {
        await triggerPDFDownload(invoiceHtml, `AVARONI_Invoice_${order.orderNumber}.pdf`);
    } catch (e) {
        console.error("PDF generation error:", e);
        throw e;
    }
}

async function triggerPDFDownload(htmlContent, fileName) {
    if (!window.html2pdf) {
        // Dynamically load html2pdf
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
    }
    
    return new Promise((resolve, reject) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlContent;
        
        // Use a more robust off-screen positioning that doesn't break html2canvas
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '800px';
        wrapper.style.zIndex = '-9999';
        wrapper.style.visibility = 'hidden';
        document.body.appendChild(wrapper);

        const opt = {
          margin:       0,
          filename:     fileName,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        try {
            html2pdf().set(opt).from(wrapper).save().then(() => {
                document.body.removeChild(wrapper);
                resolve();
            }).catch(e => {
                document.body.removeChild(wrapper);
                reject(e);
            });
        } catch (e) {
            document.body.removeChild(wrapper);
            reject(e);
        }
    });
}

async function downloadInvoice(orderNumber) {
    // Show a loading toast if available
    if (typeof showToast === 'function') {
        showToast('Preparing invoice for download...', 'info');
    }

    try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        const data = await res.json();
        
        if (!data.success || !data.order) {
            if (typeof showToast === 'function') {
                showToast('Could not load order details for invoice.', 'error');
            } else {
                alert('Could not load order details for invoice.');
            }
            return;
        }
        
        await generatePDFInvoice(data.order);
        
        if (typeof showToast === 'function') {
            showToast('Invoice downloaded successfully!', 'success');
        }
    } catch (err) {
        console.error('Invoice generation error:', err);
        if (typeof showToast === 'function') {
            showToast('Failed to generate invoice. Please try again.', 'error');
        } else {
            alert('Failed to generate invoice. Please try again.');
        }
    }
}

// Export for ES modules (Next.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePDFInvoice, triggerPDFDownload, downloadInvoice };
}
