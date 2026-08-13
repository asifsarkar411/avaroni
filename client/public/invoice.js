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
        
        let itemDetails = item.name;
        let extras = [];
        if (item.size) extras.push(`Size: ${item.size}`);
        if (item.color || item.colour) extras.push(`Color: ${item.color || item.colour}`);
        if (extras.length > 0) {
            itemDetails += ` <br><span style="font-size: 11px; color: #8892b0; margin-top: 4px; display: inline-block;">${extras.join(' &bull; ')}</span>`;
        }

        const rowBg = index % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;';

        itemsHtml += `
            <tr style="${rowBg} border-bottom: 1px solid #f1f5f9; transition: all 0.3s ease;">
                <td style="padding: 16px 20px; font-size: 13px; color: #64748b;">${String(index + 1).padStart(2, '0')}</td>
                <td style="padding: 16px 20px; font-size: 14px; color: #1e293b; font-weight: 600;">${itemDetails}</td>
                <td style="padding: 16px 20px; text-align: center; font-size: 13px; color: #64748b; font-weight: 500;">${quantity}</td>
                <td style="padding: 16px 20px; text-align: right; font-size: 13px; color: #64748b; font-weight: 500;">৳${price.toLocaleString()}</td>
                <td style="padding: 16px 20px; text-align: right; font-size: 14px; color: #0f172a; font-weight: 700;">৳${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });

    const discount = order.discountAmount !== undefined ? Number(order.discountAmount) : 0;
    const delivery = order.shippingFee !== undefined ? Number(order.shippingFee) : (order.totalAmount - subtotal + discount > 0 ? order.totalAmount - subtotal + discount : 0);
    
    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('cancel') || s.includes('reject')) return 'background: linear-gradient(135deg, #fee2e2, #fca5a5); color: #991b1b; border: 1px solid #f87171;';
        if (s.includes('pending')) return 'background: linear-gradient(135deg, #fef3c7, #fde68a); color: #b45309; border: 1px solid #fbbf24;';
        return 'background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #166534; border: 1px solid #4ade80;';
    };
    
    // Dynamic Accent Color Based on Order Number
    const accentColors = ['#4f46e5', '#2563eb', '#0ea5e9', '#0d9488', '#059669', '#ca8a04', '#ea580c', '#e11d48', '#db2777', '#9333ea'];
    const charSum = (order.orderNumber || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const dynamicAccent = accentColors[charSum % accentColors.length];

    const invoiceHtml = `
        <div style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%; max-width: 850px; margin: 0 auto; background: #ffffff; color: #334155; position: relative; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
            
            <!-- Dynamic Background Watermark -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 150px; font-weight: 900; color: rgba(15, 23, 42, 0.02); white-space: nowrap; pointer-events: none; z-index: 0;">AVARONI</div>

            <!-- Top Header Accent -->
            <div style="height: 12px; width: 100%; background: linear-gradient(90deg, #0f172a, ${dynamicAccent}, #0f172a); position: relative; z-index: 1;"></div>

            <div style="padding: 60px 50px; position: relative; z-index: 1;">
                <!-- Header Section -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px;">
                    <div>
                        <h1 style="margin: 0; font-size: 42px; font-weight: 900; letter-spacing: -1px; color: #0f172a; display: flex; align-items: center; gap: 10px;">
                            <span style="display: inline-block; width: 36px; height: 36px; background: ${dynamicAccent}; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);"></span>
                            AVARONI
                        </h1>
                        <p style="margin: 8px 0 0; font-size: 13px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">Premium E-Commerce Platform</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="display: inline-block; background: #f1f5f9; padding: 12px 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <h2 style="margin: 0 0 5px; font-size: 28px; font-weight: 800; letter-spacing: 2px; color: ${dynamicAccent};">INVOICE</h2>
                            <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 600;"># ${order.orderNumber}</p>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display: flex; gap: 20px; margin-bottom: 45px;">
                    <!-- Billed To -->
                    <div style="flex: 1; background: linear-gradient(145deg, #ffffff, #f8fafc); padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${dynamicAccent};"></div>
                        <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 15px; font-weight: 700;">Billed To</div>
                        <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">${order.customerName}</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; align-items: center; font-size: 13px; color: #475569;">
                                <span style="display: inline-block; width: 24px; font-size: 14px;">📍</span>
                                <span style="flex: 1; line-height: 1.4;">${order.address}</span>
                            </div>
                            <div style="display: flex; align-items: center; font-size: 13px; color: #475569;">
                                <span style="display: inline-block; width: 24px; font-size: 14px;">📞</span>
                                <span>${order.phone}</span>
                            </div>
                            ${order.email ? `
                            <div style="display: flex; align-items: center; font-size: 13px; color: #475569;">
                                <span style="display: inline-block; width: 24px; font-size: 14px;">✉️</span>
                                <span>${order.email}</span>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- Payment Details -->
                    <div style="flex: 1; background: linear-gradient(145deg, #ffffff, #f8fafc); padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden;">
                        <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 15px; font-weight: 700;">Order Details</div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                            <span style="font-size: 13px; color: #64748b;">Order Date:</span>
                            <strong style="font-size: 13px; color: #0f172a;">${orderDate}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                            <span style="font-size: 13px; color: #64748b;">Payment Method:</span>
                            <strong style="font-size: 13px; color: #0f172a; text-transform: capitalize;">${order.paymentMethod || 'Cash on Delivery'}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="font-size: 13px; color: #64748b;">Transaction ID:</span>
                            <strong style="font-size: 13px; color: #0f172a; word-break: break-all; max-width: 60%; text-align: right;">${order.transactionId || 'N/A'}</strong>
                        </div>
                        
                        <div style="display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; ${getStatusStyle(order.status)}">
                            STATUS: ${order.status || 'Pending'}
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <div style="border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); margin-bottom: 40px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #0f172a;">
                                <th style="color: #ffffff; padding: 18px 20px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">#</th>
                                <th style="color: #ffffff; padding: 18px 20px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Description</th>
                                <th style="color: #ffffff; padding: 18px 20px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                                <th style="color: #ffffff; padding: 18px 20px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                                <th style="color: #ffffff; padding: 18px 20px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Totals Section -->
                <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
                    <div style="width: 380px; background: #ffffff; border-radius: 16px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569;">
                            <span>Subtotal</span>
                            <strong style="color: #0f172a;">৳${subtotal.toLocaleString()}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569;">
                            <span>Shipping & Handling</span>
                            <strong style="color: #0f172a;">৳${delivery.toLocaleString()}</strong>
                        </div>
                        ${discount > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #10b981;">
                            <span>Discount ${order.promoCode ? `(${order.promoCode})` : ''}</span>
                            <strong>-৳${discount.toLocaleString()}</strong>
                        </div>
                        ` : ''}
                        
                        <div style="margin-top: 15px; padding-top: 20px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end;">
                            <span style="font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Grand Total</span>
                            <span style="font-size: 32px; font-weight: 900; color: ${dynamicAccent}; letter-spacing: -1px; line-height: 1;">৳${Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                        <div style="text-align: right; margin-top: 8px; font-size: 11px; color: #94a3b8; font-weight: 500;">All prices include applicable taxes</div>
                    </div>
                </div>
                
                <!-- Notes -->
                <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid ${dynamicAccent}; border-radius: 4px 8px 8px 4px;">
                    <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 5px;">Terms & Conditions</strong>
                    <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">Returns must be made within 7 days of delivery. Items must be unworn and in original condition with tags attached. This is a computer generated invoice and does not require a physical signature.</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 25px; background: #0f172a; color: #ffffff; position: relative;">
                <!-- Bottom Decorative Bar -->
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: ${dynamicAccent};"></div>
                
                <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 10px; letter-spacing: 1px;">THANK YOU FOR CHOOSING AVARONI</h3>
                <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin: 0; display: flex; justify-content: center; gap: 20px;">
                    <span><i style="margin-right: 5px;">🌍</i> www.avaroni.com</span>
                    <span><i style="margin-right: 5px;">✉️</i> support@avaroni.com</span>
                </p>
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
        const finalHtml = '<div style=\"width: 800px; padding: 20px; background: #ffffff;\">' + htmlContent + '</div>';
        
        const opt = {
          margin:       0.1,
          filename:     fileName,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, logging: true, windowWidth: 800 },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        try {
            html2pdf().set(opt).from(finalHtml).save().then(() => {
                resolve();
            }).catch(e => {
                console.error('html2pdf error:', e);
                reject(e);
            });
        } catch (e) {
            console.error('html2pdf sync error:', e);
            reject(e);
        }
    });
}