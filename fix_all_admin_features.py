import re
import os

print("Injecting comprehensive modals and tabs into admin.html...")

with open('public/admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace or add Supplier & Purchase Modals
supplier_modals_html = """
    <!-- ADD SUPPLIER MODAL -->
    <div id="add-supplier-modal" class="modal" style="display:none; position:fixed; z-index:1050; left:0; top:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.7); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); overflow-y:auto;">
        <div style="background:#fff; margin:40px auto; padding:28px; border-radius:16px; max-width:520px; width:90%; box-shadow:0 20px 50px rgba(0,0,0,0.2); position:relative;">
            <span onclick="closeAddSupplierModal()" style="position:absolute; right:20px; top:18px; font-size:26px; cursor:pointer; color:#94a3b8; font-weight:bold;">&times;</span>
            <h2 style="margin-top:0; font-size:19px; font-weight:700; color:#0f172a; margin-bottom:18px; display:flex; align-items:center; gap:10px;"><i class="fas fa-truck-loading" style="color:#0d47a1;"></i> Add New Supplier / Vendor</h2>

            <form id="add-supplier-form" onsubmit="handleAddSupplierSubmit(event)">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Supplier Full Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="sup-name" required placeholder="e.g. Karim Textile" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Phone Number <span style="color:#ef4444;">*</span></label>
                        <input type="tel" id="sup-phone" required placeholder="017XXXXXXXX" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Company / Market</label>
                        <input type="text" id="sup-company" placeholder="e.g. Islampur Cloth Market" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Email Address</label>
                        <input type="email" id="sup-email" placeholder="vendor@example.com" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom:14px;">
                    <label style="font-weight:600; font-size:13px;">Address / Shop Location</label>
                    <input type="text" id="sup-address" placeholder="Shop #12, 3rd Floor, Plaza Market" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>

                <div style="display:flex; justify-content:flex-end; gap:12px;">
                    <button type="button" onclick="closeAddSupplierModal()" class="btn" style="background:#f1f5f9; color:#475569; width:auto; padding:10px 20px; box-shadow:none;">Cancel</button>
                    <button type="submit" class="btn" style="background:#0d47a1; color:#fff; width:auto; padding:10px 24px; font-weight:700;"><i class="fas fa-save"></i> Save Supplier</button>
                </div>
            </form>
        </div>
    </div>

    <!-- SUPPLIER PAYMENT MODAL -->
    <div id="supplier-payment-modal" class="modal" style="display:none; position:fixed; z-index:1050; left:0; top:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.7); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); overflow-y:auto;">
        <div style="background:#fff; margin:40px auto; padding:28px; border-radius:16px; max-width:520px; width:90%; box-shadow:0 20px 50px rgba(0,0,0,0.2); position:relative;">
            <span onclick="closeSupplierPaymentModal()" style="position:absolute; right:20px; top:18px; font-size:26px; cursor:pointer; color:#94a3b8; font-weight:bold;">&times;</span>
            <h2 style="margin-top:0; font-size:19px; font-weight:700; color:#0f172a; margin-bottom:18px; display:flex; align-items:center; gap:10px;"><i class="fas fa-hand-holding-usd" style="color:#10b981;"></i> Record Supplier Payment</h2>

            <form id="supplier-payment-form" onsubmit="handleSupplierPaymentSubmit(event)">
                <div class="form-group" style="margin-bottom:14px;">
                    <label style="font-weight:600; font-size:13px;">Select Supplier <span style="color:#ef4444;">*</span></label>
                    <select id="pay-supplier-select" required onchange="updateSupplierPaymentDueDisplay()" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                        <option value="">-- Choose Supplier --</option>
                    </select>
                </div>

                <div id="pay-supplier-due-info" style="margin-bottom:14px; padding:10px 14px; background:#fef2f2; border-radius:8px; border:1px solid #fecaca; display:none;">
                    <span style="font-size:12px; font-weight:700; color:#dc2626;">Current Outstanding Due: <span id="pay-current-due-amount">৳ 0</span></span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Payment Amount (৳) <span style="color:#ef4444;">*</span></label>
                        <input type="number" id="pay-amount" required placeholder="5000" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Payment Method</label>
                        <select id="pay-method" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="bKash">bKash</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom:18px;">
                    <label style="font-weight:600; font-size:13px;">Notes / Voucher Reference</label>
                    <textarea id="pay-notes" rows="2" placeholder="e.g. Bank slip #1029 / Paid in full" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;"></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:12px;">
                    <button type="button" onclick="closeSupplierPaymentModal()" class="btn" style="background:#f1f5f9; color:#475569; width:auto; padding:10px 20px; box-shadow:none;">Cancel</button>
                    <button type="submit" class="btn" style="background:#10b981; color:#fff; width:auto; padding:10px 24px; font-weight:700;"><i class="fas fa-check-circle"></i> Save Payment</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ADD PURCHASE ORDER MODAL -->
    <div id="add-purchase-modal" class="modal" style="display:none; position:fixed; z-index:1050; left:0; top:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.7); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); overflow-y:auto;">
        <div style="background:#fff; margin:40px auto; padding:28px; border-radius:16px; max-width:600px; width:90%; box-shadow:0 20px 50px rgba(0,0,0,0.2); position:relative;">
            <span onclick="closeAddPurchaseModal()" style="position:absolute; right:20px; top:18px; font-size:26px; cursor:pointer; color:#94a3b8; font-weight:bold;">&times;</span>
            <h2 style="margin-top:0; font-size:19px; font-weight:700; color:#0f172a; margin-bottom:18px; display:flex; align-items:center; gap:10px;"><i class="fas fa-file-invoice" style="color:#f59e0b;"></i> New Inventory Purchase Order</h2>

            <form id="add-purchase-form" onsubmit="handleAddPurchaseSubmit(event)">
                <div class="form-group" style="margin-bottom:14px;">
                    <label style="font-weight:600; font-size:13px;">Supplier / Vendor <span style="color:#ef4444;">*</span></label>
                    <select id="po-supplier-select" required style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                        <option value="">-- Choose Supplier --</option>
                    </select>
                </div>

                <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:14px;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Product Description <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="po-product-name" required placeholder="e.g. Georgette Saree (Lot 50)" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Quantity</label>
                        <input type="number" id="po-qty" value="1" min="1" oninput="calcPoTotal()" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Unit Cost (৳)</label>
                        <input type="number" id="po-unit-cost" value="0" oninput="calcPoTotal()" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Total Purchase Amount (৳)</label>
                        <input type="number" id="po-total-amount" readonly style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; background:#f8fafc; font-weight:700;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-weight:600; font-size:13px;">Paid Now (৳)</label>
                        <input type="number" id="po-paid-amount" value="0" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom:18px;">
                    <label style="font-weight:600; font-size:13px;">Purchase Notes / Batch Number</label>
                    <textarea id="po-notes" rows="2" placeholder="e.g. Batch #2026-B, 50 pcs received in good condition" style="width:100%; padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px;"></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:12px;">
                    <button type="button" onclick="closeAddPurchaseModal()" class="btn" style="background:#f1f5f9; color:#475569; width:auto; padding:10px 20px; box-shadow:none;">Cancel</button>
                    <button type="submit" class="btn" style="background:#f59e0b; color:#fff; width:auto; padding:10px 24px; font-weight:700;"><i class="fas fa-save"></i> Save Purchase Order</button>
                </div>
            </form>
        </div>
    </div>
"""

# Replace in html
if "<!-- ADD SUPPLIER MODAL -->" not in html:
    insert_pos = html.find('<script src="invoice.js"></script>')
    if insert_pos != -1:
        html = html[:insert_pos] + supplier_modals_html + "\n" + html[insert_pos:]
        with open('public/admin.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("Injected modals into public/admin.html")

print("Modals configured.")
