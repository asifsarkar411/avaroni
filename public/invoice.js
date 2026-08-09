// ==========================================
// DOWNLOADABLE INVOICE GENERATOR
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
            <tr style="border-bottom: 1px solid #eaeaea;">
                <td style="padding: 12px 15px; font-size: 13px; color: #555;">${index + 1}</td>
                <td style="padding: 12px 15px; font-size: 13px; color: #111; font-weight: 500;">${item.name}</td>
                <td style="padding: 12px 15px; text-align: center; font-size: 13px; color: #555;">${quantity}</td>
                <td style="padding: 12px 15px; text-align: right; font-size: 13px; color: #555;">৳${price.toLocaleString()}</td>
                <td style="padding: 12px 15px; text-align: right; font-size: 13px; color: #111; font-weight: 600;">৳${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });

    const discount = order.discountAmount !== undefined ? Number(order.discountAmount) : 0;
    const delivery = order.shippingFee !== undefined ? Number(order.shippingFee) : (order.totalAmount - subtotal + discount > 0 ? order.totalAmount - subtotal + discount : 0);

    const invoiceHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; color: #333; box-sizing: border-box;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h1 style="margin: 0; font-size: 32px; color: #111; letter-spacing: 1px; text-transform: uppercase;">AVARONI</h1>
                    <p style="margin: 5px 0 0; color: #888; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase;">Premium Fashion & Beauty</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0; font-size: 28px; color: #111; font-weight: 300; letter-spacing: 2px;">INVOICE</h2>
                    <p style="margin: 8px 0 0; font-size: 13px; color: #666;"><strong>Order No:</strong> ${order.orderNumber}</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #666;"><strong>Date:</strong> ${orderDate}</p>
                </div>
            </div>

            <!-- Customer & Payment Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div>
                    <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Billed To</h3>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #111; font-weight: 600;">${order.customerName}</p>
                    <p style="margin: 0 0 4px; font-size: 13px; color: #555;">${order.phone}</p>
                    <p style="margin: 0 0 4px; font-size: 13px; color: #555;">${order.email}</p>
                    <p style="margin: 0; font-size: 13px; color: #555; max-width: 250px; line-height: 1.4;">${order.address}</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Payment Information</h3>
                    <p style="margin: 0 0 4px; font-size: 13px; color: #111;"><strong>Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
                    <p style="margin: 0 0 4px; font-size: 13px; color: #111;"><strong>TrxID:</strong> ${order.transactionId || 'N/A'}</p>
                    <p style="margin: 0; font-size: 13px; color: #111;"><strong>Status:</strong> <span style="color: #28a745;">${order.status || 'Pending'}</span></p>
                </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background: #111; color: #fff;">
                        <th style="padding: 12px 15px; text-align: left; font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">#</th>
                        <th style="padding: 12px 15px; text-align: left; font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Item Description</th>
                        <th style="padding: 12px 15px; text-align: center; font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Qty</th>
                        <th style="padding: 12px 15px; text-align: right; font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Price</th>
                        <th style="padding: 12px 15px; text-align: right; font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- Totals Section -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 50px;">
                <div style="width: 320px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #eaeaea;">
                        <span style="font-size: 13px; color: #555;">Subtotal</span>
                        <span style="font-size: 13px; color: #111; font-weight: 500;">৳${subtotal.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #eaeaea;">
                        <span style="font-size: 13px; color: #555;">Delivery Fee</span>
                        <span style="font-size: 13px; color: #111; font-weight: 500;">৳${delivery.toLocaleString()}</span>
                    </div>
                    ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #eaeaea;">
                        <span style="font-size: 13px; color: #e60050; font-weight: 500;">Discount ${order.promoCode ? `(${order.promoCode})` : ''}</span>
                        <span style="font-size: 13px; color: #e60050; font-weight: 500;">-৳${discount.toLocaleString()}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 15px; background: #111; color: #fff; margin-top: 10px; border-radius: 4px;">
                        <span style="font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Grand Total</span>
                        <span style="font-size: 18px; font-weight: 700;">৳${Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px;">
                <p style="margin: 0 0 5px; font-size: 14px; color: #111; font-weight: 500;">Thank you for shopping with AVARONI!</p>
                <p style="margin: 0; font-size: 11px; color: #888;">This is a computer-generated invoice and does not require a signature.</p>
                <p style="margin: 5px 0 0; font-size: 11px; color: #888;">If you have any questions concerning this invoice, contact support@avaroni.com.</p>
            </div>
        </div>
    `;

    await triggerPDFDownload(invoiceHtml, `Invoice_${order.orderNumber}.pdf`);
}

async function triggerPDFDownload(htmlContent, fileName) {
    if (!window.html2pdf) {
        // Dynamically load html2pdf
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
    }
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlContent;
    
    // We append it to body temporarily off-screen so html2pdf can render it correctly
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    document.body.appendChild(wrapper);

    const opt = {
      margin:       0,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(wrapper).save().then(() => {
        document.body.removeChild(wrapper);
    });
}

function downloadInvoice(orderNumber) {
    // Show a loading toast if available
    if (typeof showToast === 'function') {
        showToast('Preparing invoice for download...', 'info');
    }

    fetch(`/api/orders/${orderNumber}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.order) {
                alert('Could not load order details for invoice.');
                return;
            }
            generatePDFInvoice(data.order);
        })
        .catch(err => {
            console.error('Invoice generation error:', err);
            alert('Failed to generate invoice. Please try again.');
        });
}

// Export for ES modules (Next.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generatePDFInvoice, triggerPDFDownload, downloadInvoice };
}
