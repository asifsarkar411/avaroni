// ==========================================
// DOWNLOADABLE INVOICE GENERATOR
// ==========================================

function downloadInvoice(orderNumber) {
    fetch(`/api/orders/${orderNumber}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.order) {
                alert('Could not load order details for invoice.');
                return;
            }
            const order = data.order;
            const orderDate = new Date(order.orderDate).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });

            let itemsHtml = '';
            let subtotal = 0;
            order.cartItems.forEach((item, index) => {
                const itemTotal = Number(item.price) * Number(item.quantity);
                subtotal += itemTotal;
                itemsHtml += `
                    <tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">${index + 1}</td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px;">${item.name}</td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 13px;">${item.quantity}</td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 13px;">\u09f3${Number(item.price).toLocaleString()}</td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 13px; font-weight: 600;">\u09f3${itemTotal.toLocaleString()}</td>
                    </tr>
                `;
            });

            const delivery = order.totalAmount - subtotal > 0 ? order.totalAmount - subtotal : 0;
            const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 30px; color: #333; background: #fff; }
        .invoice-container { max-width: 700px; margin: 0 auto; }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #e60050; padding-bottom: 20px; margin-bottom: 25px; }
        .invoice-brand h1 { margin: 0; font-size: 28px; color: #e60050; }
        .invoice-brand p { margin: 5px 0 0; color: #888; font-size: 13px; }
        .invoice-meta { text-align: right; }
        .invoice-meta h2 { margin: 0; font-size: 22px; color: #333; letter-spacing: 2px; }
        .invoice-meta p { margin: 4px 0; font-size: 13px; color: #666; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .invoice-details div { flex: 1; }
        .invoice-details h3 { font-size: 12px; text-transform: uppercase; color: #e60050; margin: 0 0 8px; letter-spacing: 1px; }
        .invoice-details p { margin: 3px 0; font-size: 13px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead tr { background: #ffe6ef; }
        thead th { padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #e60050; font-weight: 700; letter-spacing: 0.5px; }
        thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
        .totals-section { display: flex; justify-content: flex-end; }
        .totals-table { width: 250px; }
        .totals-table .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #555; }
        .totals-table .row.grand-total { border-top: 2px solid #e60050; margin-top: 8px; padding-top: 10px; font-size: 18px; font-weight: 700; color: #e60050; }
        .invoice-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="invoice-brand">
                <h1>\u0986\u09ad\u09b0\u09a3\u09c0</h1>
                <p>Your one-stop shop for fashion and beauty</p>
            </div>
            <div class="invoice-meta">
                <h2>INVOICE</h2>
                <p><strong>Order:</strong> ${order.orderNumber}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod || 'N/A'}</p>
            </div>
        </div>

        <div class="invoice-details">
            <div>
                <h3>Billed To</h3>
                <p><strong>${order.customerName}</strong></p>
                <p>${order.phone}</p>
                <p>${order.email}</p>
                <p>${order.address}</p>
            </div>
            <div style="text-align: right;">
                <h3>Transaction</h3>
                <p><strong>TrxID:</strong> ${order.transactionId || 'N/A'}</p>
            </div>
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
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-table">
                <div class="row"><span>Subtotal</span><span>\u09f3${subtotal.toLocaleString()}</span></div>
                <div class="row"><span>Delivery</span><span>\u09f3${delivery.toLocaleString()}</span></div>
                <div class="row grand-total"><span>Total</span><span>\u09f3${Number(order.totalAmount).toLocaleString()}</span></div>
            </div>
        </div>

        <div class="invoice-footer">
            <p>Thank you for shopping with \u0986\u09ad\u09b0\u09a3\u09c0!</p>
            <p>This is a computer-generated invoice. No signature required.</p>
        </div>
    </div>
</body>
</html>`;

            // Open invoice in a new window and trigger print/save as PDF
            const printWindow = window.open('', '_blank');
            printWindow.document.write(invoiceHtml);
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
            };
        })
        .catch(err => {
            console.error('Invoice generation error:', err);
            alert('Failed to generate invoice. Please try again.');
        });
}
