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
            <tr>
                <td style="padding: 16px 15px; font-size: 14px; color: #333; border-bottom: 1px solid #eaeaea;">${index + 1}</td>
                <td style="padding: 16px 15px; font-size: 14px; color: #111; font-weight: 500; border-bottom: 1px solid #eaeaea;">${item.name}</td>
                <td style="padding: 16px 15px; text-align: center; font-size: 14px; color: #333; border-bottom: 1px solid #eaeaea;">${quantity}</td>
                <td style="padding: 16px 15px; text-align: right; font-size: 14px; color: #333; border-bottom: 1px solid #eaeaea;">৳${price.toLocaleString()}</td>
                <td style="padding: 16px 15px; text-align: right; font-size: 14px; color: #111; font-weight: 600; border-bottom: 1px solid #eaeaea;">৳${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });

    const discount = order.discountAmount !== undefined ? Number(order.discountAmount) : 0;
    const delivery = order.shippingFee !== undefined ? Number(order.shippingFee) : (order.totalAmount - subtotal + discount > 0 ? order.totalAmount - subtotal + discount : 0);

    const invoiceHtml = `
        <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff; padding: 30px; color: #333; box-sizing: border-box;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 30px; border-bottom: 1px solid #eaeaea; margin-bottom: 40px;">
                <div>
                    <h1 style="margin: 0; font-size: 34px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #111;">AVARONI</h1>
                    <p style="margin: 5px 0 0; font-size: 12px; color: #777; letter-spacing: 1px; text-transform: uppercase;">Premium Fashion & Beauty</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0 0 10px; font-size: 28px; font-weight: 300; letter-spacing: 2px; color: #333;">INVOICE</h2>
                    <p style="margin: 4px 0; font-size: 14px; color: #777;"><strong>Order No:</strong> <span style="color: #111; font-weight: 600;">${order.orderNumber}</span></p>
                    <p style="margin: 4px 0; font-size: 14px; color: #777;"><strong>Date:</strong> <span style="color: #111; font-weight: 600;">${orderDate}</span></p>
                </div>
            </div>

            <!-- Customer & Payment Details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; background: #fafafa; padding: 25px; border-radius: 8px; border: 1px solid #f0f0f0;">
                <div>
                    <h3 style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; color: #777; letter-spacing: 1px;">Billed To</h3>
                    <p style="margin: 0 0 6px; font-size: 15px; font-weight: 600; color: #111;">${order.customerName}</p>
                    <p style="margin: 0 0 6px; font-size: 14px; color: #333;">${order.phone}</p>
                    <p style="margin: 0 0 6px; font-size: 14px; color: #333;">${order.email}</p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #555; line-height: 1.5;">${order.address}</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; color: #777; letter-spacing: 1px;">Payment Information</h3>
                    <p style="margin: 0 0 6px; font-size: 14px; color: #333;"><strong>Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
                    <p style="margin: 0 0 6px; font-size: 14px; color: #333;"><strong>TrxID:</strong> ${order.transactionId || 'N/A'}</p>
                    <div style="display: inline-block; padding: 4px 10px; background: #e8f5e9; color: #2e7d32; border-radius: 4px; font-size: 12px; font-weight: 600; margin-top: 5px;">${order.status || 'Pending'}</div>
                </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <thead>
                    <tr>
                        <th style="background: #f9f9f9; padding: 15px; text-align: left; font-size: 12px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #111;">#</th>
                        <th style="background: #f9f9f9; padding: 15px; text-align: left; font-size: 12px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #111;">Item Description</th>
                        <th style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #111;">Qty</th>
                        <th style="background: #f9f9f9; padding: 15px; text-align: right; font-size: 12px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #111;">Price</th>
                        <th style="background: #f9f9f9; padding: 15px; text-align: right; font-size: 12px; font-weight: 600; color: #777; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #111;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- Totals Section -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 50px;">
                <div style="width: 350px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #eaeaea; font-size: 14px;">
                        <span>Subtotal</span>
                        <strong>৳${subtotal.toLocaleString()}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #eaeaea; font-size: 14px;">
                        <span>Delivery Fee</span>
                        <strong>৳${delivery.toLocaleString()}</strong>
                    </div>
                    ${discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #eaeaea; font-size: 14px; color: #e60050;">
                        <span>Discount ${order.promoCode ? `(${order.promoCode})` : ''}</span>
                        <strong>-৳${discount.toLocaleString()}</strong>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #111; color: #ffffff; padding: 18px 15px; border-radius: 6px; margin-top: 15px;">
                        <span style="font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Grand Total</span>
                        <span style="font-size: 20px; font-weight: 700;">৳${Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #eaeaea; padding-top: 25px;">
                <p style="font-size: 16px; font-weight: 600; color: #111; margin: 0 0 8px;">Thank you for shopping with AVARONI!</p>
                <p style="font-size: 12px; color: #777; margin: 4px 0;">This is a computer-generated invoice and does not require a signature.</p>
                <p style="font-size: 12px; color: #777; margin: 4px 0;">If you have any questions concerning this invoice, contact support@avaroni.com.</p>
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
