// ==========================================
// AVARONI PREMIUM INVOICE GENERATOR
// ==========================================

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            return resolve();
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function ensureLibraries() {
    const promises = [];
    if (!window.html2canvas) {
        promises.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
    }
    if (!window.jspdf) {
        promises.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
    }
    await Promise.all(promises);
}

async function generatePDFInvoice(order) {
    if (!order) {
        console.error("Cannot generate invoice: No order data provided.");
        return;
    }
    
    const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const orderNumRaw = order.orderNumber || order.orderId || order._id || '1';
    let digitsOnly = String(orderNumRaw).replace(/\D/g, '');
    if (!digitsOnly) digitsOnly = String(orderNumRaw).slice(-7);
    const invoiceDisplayNum = digitsOnly.padStart(7, '0');
    const displayOrderNum = order.orderNumber ? String(order.orderNumber) : ('ORD-' + invoiceDisplayNum);

    let itemsHtml = '';
    let subtotal = 0;
    
    const cartItems = order.cartItems || [];
    cartItems.forEach((item, index) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const itemTotal = price * quantity;
        subtotal += itemTotal;
        
        let itemTitle = 'Product Item';
        if (item) {
            if (typeof item === 'string') {
                itemTitle = item;
            } else {
                itemTitle = item.name || item.dressName || item.productName || item.title || (item.product && (item.product.name || item.product.title)) || 'Product Item';
            }
        }
        
        let extras = [];
        if (item.size || item.selectedSize) extras.push(`Size: ${item.size || item.selectedSize}`);
        if (item.color || item.colour || item.selectedColour) extras.push(`Color: ${item.color || item.colour || item.selectedColour}`);
        
        let itemDetails = `<span style="font-weight: 700; color: #0f172a; font-size: 13px;">${itemTitle}</span>`;
        if (extras.length > 0) {
            itemDetails += `<br><span style="font-size: 11px; color: #64748b; margin-top: 3px; display: inline-block;">${extras.join(' &bull; ')}</span>`;
        }

        const rowBg = index % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;';

        itemsHtml += `
            <tr style="${rowBg} border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; vertical-align: middle;">${String(index + 1).padStart(2, '0')}</td>
                <td style="padding: 10px 14px; vertical-align: middle;">${itemDetails}</td>
                <td style="padding: 10px 14px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; vertical-align: middle;">${quantity}</td>
                <td style="padding: 10px 14px; text-align: right; font-size: 12px; color: #64748b; font-weight: 600; vertical-align: middle;">৳${price.toLocaleString()}</td>
                <td style="padding: 10px 14px; text-align: right; font-size: 13px; color: #0f172a; font-weight: 700; vertical-align: middle;">৳${itemTotal.toLocaleString()}</td>
            </tr>
        `;
    });

    const discount = order.discountAmount !== undefined ? Number(order.discountAmount) : 0;
    const delivery = order.shippingFee !== undefined ? Number(order.shippingFee) : (order.totalAmount - subtotal + discount > 0 ? order.totalAmount - subtotal + discount : 0);
    
    // Dynamic Accent Color Based on Order Number
    const accentColors = ['#0d9488', '#2563eb', '#4f46e5', '#059669', '#ca8a04', '#ea580c', '#e11d48', '#db2777', '#9333ea'];
    const charSum = String(displayOrderNum).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const dynamicAccent = accentColors[charSum % accentColors.length];

    let dynamicBrandName = 'AVARONI';
    let dynamicBrandLogo = '/img/profile_image.jpg';
    try {
        const cachedName = localStorage.getItem('site_brand_name');
        const cachedLogo = localStorage.getItem('site_brand_logo');
        if (cachedName) dynamicBrandName = cachedName;
        if (cachedLogo) dynamicBrandLogo = cachedLogo;
    } catch(e) {}

    try {
        const sRes = await fetch('/api/settings');
        const sData = await sRes.json();
        if (sData.success && sData.settings) {
            if (sData.settings.brandName) dynamicBrandName = sData.settings.brandName;
            if (sData.settings.brandLogo) dynamicBrandLogo = sData.settings.brandLogo;
        }
    } catch(e) {}

    const invoiceHtml = `
        <div id="invoice-doc" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; width: 800px; min-width: 800px; max-width: 800px; box-sizing: border-box; margin: 0; background: #ffffff; color: #334155; position: relative; overflow: hidden;">
            
            <!-- Dynamic Background Watermark -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 110px; font-weight: 900; color: rgba(15, 23, 42, 0.025); white-space: nowrap; pointer-events: none; z-index: 0; text-transform: uppercase;">${dynamicBrandName}</div>

            <!-- Top Header Accent -->
            <div style="height: 8px; width: 100%; background: linear-gradient(90deg, #0f172a, ${dynamicAccent}, #0f172a); position: relative; z-index: 1;"></div>

            <div style="padding: 28px 35px 20px; position: relative; z-index: 1; box-sizing: border-box;">
                <!-- Header Section with Round Brand Logo & Invoice Number Box -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${dynamicBrandLogo}" alt="${dynamicBrandName} Logo" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid ${dynamicAccent}; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" onerror="this.src='./img/profile_image.jpg';">
                        <div>
                            <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; line-height: 1.1;">
                                ${dynamicBrandName}
                            </h1>
                            <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Premium Fashion & Lifestyle</p>
                        </div>
                    </div>
                    
                    <!-- Top Right Invoice Box -->
                    <div style="width: 220px; min-width: 220px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: right; box-sizing: border-box;">
                        <div style="font-size: 15px; font-weight: 800; letter-spacing: 1px; color: ${dynamicAccent}; margin-bottom: 4px; text-transform: uppercase;">INVOICE</div>
                        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 3px;">Invoice ${invoiceDisplayNum}</div>
                        <div style="font-size: 11px; font-weight: 600; color: #475569;">Order ID: ${displayOrderNum}</div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <!-- Billed To -->
                    <div style="flex: 1; background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; box-sizing: border-box;">
                        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${dynamicAccent};"></div>
                        <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 6px; font-weight: 700;">Billed To</div>
                        <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">${order.customerName || order.name || 'Customer'}</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569;">
                            <div style="display: flex; gap: 5px;">
                                <span>📍</span>
                                <span style="line-height: 1.3;">${order.address || 'N/A'}</span>
                            </div>
                            <div style="display: flex; gap: 5px;">
                                <span>📞</span>
                                <span>${order.phone || 'N/A'}</span>
                            </div>
                            ${order.email ? `
                            <div style="display: flex; gap: 5px;">
                                <span>✉️</span>
                                <span>${order.email}</span>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- Payment & Order Details (No Status Option) -->
                    <div style="flex: 1; background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; box-sizing: border-box;">
                        <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 6px; font-weight: 700;">Order Details</div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; font-size: 11px;">
                            <span style="color: #64748b;">Order ID:</span>
                            <strong style="color: #0f172a;">${displayOrderNum}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; font-size: 11px;">
                            <span style="color: #64748b;">Invoice No:</span>
                            <strong style="color: #0f172a;">${invoiceDisplayNum}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; font-size: 11px;">
                            <span style="color: #64748b;">Order Date:</span>
                            <strong style="color: #0f172a;">${orderDate}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 3px; font-size: 11px;">
                            <span style="color: #64748b;">Payment Method:</span>
                            <strong style="color: #0f172a; text-transform: capitalize;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : (order.paymentMethod || 'Cash on Delivery')}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px;">
                            <span style="color: #64748b;">Transaction ID:</span>
                            <strong style="color: #0f172a; word-break: break-all; max-width: 60%; text-align: right;">${order.transactionId || order.trxId || 'N/A'}</strong>
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <div style="border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background: #0f172a;">
                                <th style="color: #ffffff; padding: 9px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 40px;">#</th>
                                <th style="color: #ffffff; padding: 9px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Item / Dress Name</th>
                                <th style="color: #ffffff; padding: 9px 14px; text-align: center; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 60px;">Qty</th>
                                <th style="color: #ffffff; padding: 9px 14px; text-align: right; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 110px;">Price</th>
                                <th style="color: #ffffff; padding: 9px 14px; text-align: right; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 120px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Totals Section -->
                <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
                    <div style="width: 300px; background: #f8fafc; border-radius: 10px; padding: 12px 16px; border: 1px solid #e2e8f0; box-sizing: border-box;">
                        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; color: #475569;">
                            <span>Subtotal</span>
                            <strong style="color: #0f172a;">৳${subtotal.toLocaleString()}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; color: #475569;">
                            <span>Shipping & Handling</span>
                            <strong style="color: #0f172a;">৳${delivery.toLocaleString()}</strong>
                        </div>
                        ${discount > 0 ? `
                        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; color: #10b981;">
                            <span>Discount ${order.promoCode ? `(${order.promoCode})` : ''}</span>
                            <strong>-৳${discount.toLocaleString()}</strong>
                        </div>
                        ` : ''}
                        
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end;">
                            <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</span>
                            <span style="font-size: 24px; font-weight: 900; color: ${dynamicAccent}; letter-spacing: -0.5px; line-height: 1;">৳${Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                        <div style="text-align: right; margin-top: 4px; font-size: 10px; color: #94a3b8; font-weight: 500;">All prices include applicable taxes</div>
                    </div>
                </div>
                
                <!-- Notes -->
                <div style="margin-bottom: 12px; padding: 8px 12px; background: #f8fafc; border-left: 4px solid ${dynamicAccent}; border-radius: 4px 6px 6px 4px; font-size: 10px; color: #64748b; line-height: 1.35;">
                    <strong style="color: #0f172a; display: block; margin-bottom: 1px;">Terms & Conditions</strong>
                    Returns accepted within 7 days of delivery for unworn items with tags intact. Computer generated invoice.
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 14px; background: #0f172a; color: #ffffff; position: relative;">
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: ${dynamicAccent};"></div>
                <h3 style="font-size: 12px; font-weight: 700; margin: 0 0 3px; letter-spacing: 1px; text-transform: uppercase;">Thank You For Choosing AVARONI</h3>
                <p style="font-size: 10px; color: rgba(255, 255, 255, 0.6); margin: 0;">
                    www.avaroni.com &bull; support@avaroni.com
                </p>
            </div>
        </div>
    `;

    try {
        await triggerPDFDownload(invoiceHtml, `AVARONI_Invoice_${invoiceDisplayNum}.pdf`);
    } catch (e) {
        console.error("PDF generation error:", e);
        throw e;
    }
}

async function triggerPDFDownload(htmlContent, fileName) {
    await ensureLibraries();

    return new Promise((resolve, reject) => {
        // Create an isolated hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '-99999px';
        iframe.style.width = '800px';
        iframe.style.height = '1400px';
        iframe.style.border = 'none';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        iframe.style.zIndex = '-9999';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { background: #ffffff; width: 800px; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        iframeDoc.close();

        // Wait a short tick for iframe to render fonts and image
        setTimeout(async () => {
            try {
                const targetElement = iframeDoc.getElementById('invoice-doc') || iframeDoc.body;
                
                const canvas = await window.html2canvas(targetElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: 800,
                    windowWidth: 800,
                    scrollY: 0,
                    scrollX: 0
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
                
                if (!jsPDFConstructor) {
                    throw new Error("jsPDF library not available");
                }

                const pdf = new jsPDFConstructor({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
                const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                if (pdfHeight <= pdfPageHeight) {
                    // Fits perfectly on single page with 100% full width coverage
                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                } else {
                    // Multi-page slicing if order has many items
                    let heightLeft = pdfHeight;
                    let position = 0;
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pdfPageHeight;
                    while (heightLeft > 0) {
                        position -= pdfPageHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                        heightLeft -= pdfPageHeight;
                    }
                }
                pdf.save(fileName);
                resolve();
            } catch (err) {
                console.error("PDF generation error:", err);
                reject(err);
            } finally {
                if (iframe && iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }
        }, 220);
    });
}

window.generatePDFInvoice = generatePDFInvoice;
window.triggerPDFDownload = triggerPDFDownload;

window.downloadInvoice = async function(orderNumber) {
    if (!orderNumber) {
        alert("Invalid order number");
        return;
    }
    try {
        const response = await fetch('/api/orders/' + encodeURIComponent(orderNumber));
        const data = await response.json();
        if (data.success && data.order) {
            await generatePDFInvoice(data.order);
        } else {
            console.error('Order not found', data);
            alert('Failed to load invoice details for #' + orderNumber);
        }
    } catch (e) {
        console.error('Error downloading invoice:', e);
        alert('An error occurred while generating the invoice.');
    }
};
