import os
import re

print("Starting deep update of admin panel features...")

# Read public/admin.html
admin_html_path = 'public/admin.html'
with open(admin_html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Make sure buttons for Add Supplier, Supplier Payment, Add Purchase are visible in Purchases tab
purchases_header_pattern = r'(<h2[^>]*><i class="fas fa-truck-loading"[^>]*></i>\s*Purchases &amp; Suppliers</h2>\s*<p[^>]*>[^<]*</p>\s*</div>)'
replacement_header = r'''\1
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button class="btn" onclick="openAddSupplierModal()" style="background:#0d47a1; color:#fff; width:auto; padding:9px 18px; font-weight:600; font-size:13px;"><i class="fas fa-plus"></i> Add Supplier</button>
                            <button class="btn" onclick="openSupplierPaymentModal()" style="background:#10b981; color:#fff; width:auto; padding:9px 18px; font-weight:600; font-size:13px;"><i class="fas fa-hand-holding-usd"></i> Supplier Payment</button>
                            <button class="btn" onclick="openAddPurchaseModal()" style="background:#f59e0b; color:#fff; width:auto; padding:9px 18px; font-weight:600; font-size:13px;"><i class="fas fa-file-invoice"></i> Add Purchase Order</button>
                        </div>'''

if 'openAddSupplierModal()' not in html_content:
    html_content = re.sub(purchases_header_pattern, replacement_header, html_content, count=1)
    with open(admin_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Updated purchases header with action buttons.")

# Now check public/admin.js
admin_js_path = 'public/admin.js'
with open(admin_js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Let's inspect tab routing in switchTab
old_switch_data_fetch = '''    // Fetch data dynamically based on active tab
    if (tabName === 'dashboard') { fetchDashboardStats(); fetchDashboardVisuals(); fetchManageProducts(); }
    if (tabName === 'orders') fetchOrders();
    if (tabName === 'manage-products') fetchManageProducts();
    if (tabName === 'add-product') populateAddProductCategories();
    if (tabName === 'manage-categories') renderCategoriesTab();
    if (tabName === 'manage-promocodes') fetchPromoCodes();
    if (tabName === 'manage-vouchers') fetchVouchers();
    if (tabName === 'manage-banners') loadAdminBanners();
    if (tabName === 'manage-popup') fetchSettings();
    if (tabName === 'manage-returns') fetchReturnRequests();
    if (tabName === 'manage-messages') fetchContactMessages();
    if (tabName === 'manage-customers') fetchCustomerUsers();
    if (tabName === 'manage-reviews') fetchAdminReviews();
    if (tabName === 'user-tracking') fetchUserTrackingAnalytics();
    if (tabName === 'manage-flash-sale') initFlashSaleTab();
    if (tabName === 'manage-blogs') fetchAdminBlogs();
    if (tabName === 'admin-settings') initSettingsTab();
    if (tabName === 'landing-page') fetchAdminLandingPages();
    if (tabName === 'expenses') fetchAdminExpenses();
    if (tabName === 'purchases') { fetchAdminPurchases(); fetchAdminSuppliers(); }'''

new_switch_data_fetch = '''    // Fetch data dynamically based on active tab
    if (tabName === 'dashboard') { fetchDashboardStats(); fetchDashboardVisuals(); fetchManageProducts(); }
    if (tabName === 'orders') fetchOrders();
    if (tabName === 'manage-products') fetchManageProducts();
    if (tabName === 'add-product') populateAddProductCategories();
    if (tabName === 'manage-categories') renderCategoriesTab();
    if (tabName === 'manage-promocodes') fetchPromoCodes();
    if (tabName === 'manage-vouchers') fetchVouchers();
    if (tabName === 'manage-banners') loadAdminBanners();
    if (tabName === 'manage-popup') fetchSettings();
    if (tabName === 'manage-returns') fetchReturnRequests();
    if (tabName === 'manage-messages') fetchContactMessages();
    if (tabName === 'manage-customers') fetchCustomerUsers();
    if (tabName === 'manage-reviews') fetchAdminReviews();
    if (tabName === 'user-tracking') fetchUserTrackingAnalytics();
    if (tabName === 'manage-flash-sale') initFlashSaleTab();
    if (tabName === 'manage-blogs') fetchAdminBlogs();
    if (tabName === 'admin-settings' || tabName === 'security') initSettingsTab();
    if (tabName === 'landing-page') fetchAdminLandingPages();
    if (tabName === 'expenses') fetchAdminExpenses();
    if (tabName === 'purchases') { fetchAdminPurchases(); fetchAdminSuppliers(); }
    if (tabName === 'reports') fetchAdminReports();
    if (tabName === 'marketing') loadMarketingSettings();
    if (tabName === 'shipping-settings') loadShippingSettings();
    if (tabName === 'integrations') loadIntegrationSettings();'''

if old_switch_data_fetch in js_content:
    js_content = js_content.replace(old_switch_data_fetch, new_switch_data_fetch)

# Let's replace the end of admin.js with robust implementations of POS, Landing Pages, Expenses, Purchases/Suppliers, Reports, Marketing, Shipping, Integrations
features_marker = "// ==========================================================================\n// POS / CREATE QUICK ORDER FEATURE"
if features_marker in js_content:
    base_js = js_content.split(features_marker)[0]
else:
    base_js = js_content

full_features_code = """// ==========================================================================
// POS / CREATE QUICK ORDER FEATURE
// ==========================================================================
async function openPosModal() {
    const modal = document.getElementById('pos-modal');
    if (!modal) return;
    
    // Populate products in select dropdown
    const prodSelect = document.getElementById('pos-product-select');
    if (prodSelect) {
        prodSelect.innerHTML = '<option value="">-- Choose Product --</option>';
        let prodList = [];
        if (typeof currentInventoryProducts !== 'undefined' && Array.isArray(currentInventoryProducts) && currentInventoryProducts.length > 0) {
            prodList = currentInventoryProducts;
        } else {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                prodList = Array.isArray(data) ? data : (data.products || []);
                currentInventoryProducts = prodList;
            } catch (e) {
                console.error("Failed to load products for POS", e);
            }
        }
        
        if (Array.isArray(prodList)) {
            prodList.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p._id || p.id;
                const pTitle = p.title || p.name || 'Untitled Product';
                opt.textContent = `${pTitle} (৳${p.price || 0})`;
                opt.dataset.price = p.price || 0;
                opt.dataset.name = pTitle;
                prodSelect.appendChild(opt);
            });
        }
    }
    
    calcPosTotal();
    modal.style.display = 'block';
}

function closePosModal() {
    const modal = document.getElementById('pos-modal');
    if (modal) modal.style.display = 'none';
}

function updatePosProductPrice() {
    const prodSelect = document.getElementById('pos-product-select');
    const unitPriceInput = document.getElementById('pos-unit-price');
    if (prodSelect && unitPriceInput) {
        const selected = prodSelect.options[prodSelect.selectedIndex];
        if (selected && selected.dataset.price) {
            unitPriceInput.value = selected.dataset.price;
        }
    }
    calcPosTotal();
}

function calcPosTotal() {
    const qty = Number(document.getElementById('pos-product-qty')?.value) || 1;
    const price = Number(document.getElementById('pos-unit-price')?.value) || 0;
    const delivery = Number(document.getElementById('pos-delivery-fee')?.value) || 0;
    const discount = Number(document.getElementById('pos-discount')?.value) || 0;
    
    const subtotal = qty * price;
    const netTotal = Math.max(0, subtotal + delivery - discount);
    
    const display = document.getElementById('pos-net-total-display');
    if (display) display.textContent = `৳ ${netTotal.toLocaleString()}`;
}

async function handlePosOrderSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('pos-customer-name')?.value.trim();
    const phone = document.getElementById('pos-customer-phone')?.value.trim();
    const address = document.getElementById('pos-customer-address')?.value.trim();
    const prodSelect = document.getElementById('pos-product-select');
    const qty = Number(document.getElementById('pos-product-qty')?.value) || 1;
    const price = Number(document.getElementById('pos-unit-price')?.value) || 0;
    const delivery = Number(document.getElementById('pos-delivery-fee')?.value) || 0;
    const discount = Number(document.getElementById('pos-discount')?.value) || 0;

    const selectedOption = prodSelect?.options[prodSelect?.selectedIndex];
    const prodName = selectedOption?.dataset.name || (selectedOption?.value ? "Selected Product" : "Custom Order Item");

    const orderPayload = {
        name,
        phone,
        address,
        cart: [{
            title: prodName,
            price: price,
            quantity: qty,
            img: './img/profile_image.jpg'
        }],
        totalAmount: Math.max(0, (qty * price) + delivery - discount),
        deliveryCharge: delivery,
        discount: discount,
        paymentMethod: 'Cash on Delivery',
        status: 'Confirmed'
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (data.success || data._id || data.orderId) {
            showToast("POS Order created and confirmed successfully!", "success");
            closePosModal();
            fetchOrders();
            goToOrdersTab('Confirmed');
        } else {
            showToast(data.message || "Failed to create POS order", "error");
        }
    } catch (err) {
        console.error("POS order error:", err);
        showToast("Error submitting POS order.", "error");
    }
}

// ==========================================================================
// EXPENSE MANAGEMENT FEATURES
// ==========================================================================
let allAdminExpenses = [];

async function fetchAdminExpenses() {
    try {
        const res = await fetchWithAuth('/api/admin/expenses');
        const data = await res.json();
        
        if (data.success && Array.isArray(data.expenses)) {
            allAdminExpenses = data.expenses;
            renderExpensesTable(allAdminExpenses);

            // Update KPI Stats
            const total = data.total || allAdminExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const kpiTotal = document.getElementById('expense-kpi-total');
            if (kpiTotal) kpiTotal.textContent = `৳ ${total.toLocaleString()}`;

            const kpiCount = document.getElementById('expense-kpi-count');
            if (kpiCount) kpiCount.textContent = allAdminExpenses.length;

            const now = new Date();
            const thisMonthExpenses = allAdminExpenses.filter(e => {
                const d = new Date(e.date || e.created_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

            const kpiMonth = document.getElementById('expense-kpi-month');
            if (kpiMonth) kpiMonth.textContent = `৳ ${thisMonthExpenses.toLocaleString()}`;
        }
    } catch (err) {
        console.error("Fetch expenses error:", err);
    }
}

function renderExpensesTable(expenses) {
    const tbody = document.getElementById('expenses-table-body');
    if (!tbody) return;

    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">No expense records found. Click "+ Add New Expense" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = expenses.map(e => {
        const d = new Date(e.date || e.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 16px; font-size:13px; color:#64748b;">${d}</td>
                <td style="padding:12px 16px; font-size:13.5px; font-weight:600; color:#1e293b;">${escapeHTML(e.title)}</td>
                <td style="padding:12px 16px;"><span style="background:#eff6ff; color:#2563eb; font-size:11px; font-weight:700; padding:4px 8px; border-radius:6px;">${escapeHTML(e.category || 'General')}</span></td>
                <td style="padding:12px 16px; font-size:13px; color:#475569;">${escapeHTML(e.paymentMethod || 'Cash')}</td>
                <td style="padding:12px 16px; font-size:14px; font-weight:700; color:#dc2626;">৳ ${(Number(e.amount) || 0).toLocaleString()}</td>
                <td style="padding:12px 16px; text-align:right;">
                    <button onclick="deleteExpense('${e._id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function openExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (modal) {
        const dateInput = document.getElementById('modal-expense-date');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        modal.style.display = 'block';
    }
}

function closeExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (modal) modal.style.display = 'none';
}

async function handleAddExpenseSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('modal-expense-title')?.value.trim();
    const category = document.getElementById('modal-expense-category')?.value;
    const amount = Number(document.getElementById('modal-expense-amount')?.value) || 0;
    const paymentMethod = document.getElementById('modal-expense-method')?.value;
    const date = document.getElementById('modal-expense-date')?.value;
    const note = document.getElementById('modal-expense-note')?.value.trim();

    try {
        const res = await fetchWithAuth('/api/admin/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, amount, paymentMethod, date, note })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Expense recorded successfully!", "success");
            closeExpenseModal();
            fetchAdminExpenses();
        } else {
            showToast(data.message || "Failed to save expense", "error");
        }
    } catch (err) {
        console.error("Add expense error:", err);
        showToast("Error saving expense", "error");
    }
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
        const res = await fetchWithAuth(`/api/admin/expenses/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast("Expense record removed", "success");
            fetchAdminExpenses();
        }
    } catch (err) {
        showToast("Failed to delete expense", "error");
    }
}

function filterExpenseTable() {
    const q = document.getElementById('expense-search-input')?.value.toLowerCase().trim() || '';
    if (!q) {
        renderExpensesTable(allAdminExpenses);
        return;
    }
    const filtered = allAdminExpenses.filter(e => 
        (e.title && e.title.toLowerCase().includes(q)) || 
        (e.category && e.category.toLowerCase().includes(q))
    );
    renderExpensesTable(filtered);
}

// ==========================================================================
// LANDING PAGE BUILDER FEATURES
// ==========================================================================
let allLandingPages = [];

async function fetchAdminLandingPages() {
    try {
        const res = await fetchWithAuth('/api/admin/landing-pages');
        const data = await res.json();
        if (data.success && Array.isArray(data.pages)) {
            allLandingPages = data.pages;
            renderLandingPagesTable(allLandingPages);
        }
    } catch (err) {
        console.error("Fetch landing pages error:", err);
    }
}

function renderLandingPagesTable(pages) {
    const tbody = document.getElementById('landing-pages-table-body');
    if (!tbody) return;

    if (!pages || pages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No campaign landing pages yet. Create your first landing page above!</td></tr>';
        return;
    }

    tbody.innerHTML = pages.map(p => `
        <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:12px 16px; font-weight:600; color:#0f172a;">${escapeHTML(p.title)}</td>
            <td style="padding:12px 16px;"><a href="/landing/${p.slug}" target="_blank" style="color:#2563eb; font-weight:600; text-decoration:none;"><i class="fas fa-external-link-alt" style="font-size:11px; margin-right:4px;"></i> /landing/${p.slug}</a></td>
            <td style="padding:12px 16px; font-weight:700; color:#16a34a;">৳ ${p.salePrice || 0}</td>
            <td style="padding:12px 16px;"><span style="background:#f0fdf4; color:#16a34a; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">Active</span></td>
            <td style="padding:12px 16px; text-align:right;">
                <button onclick="deleteLandingPage('${p._id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function handleAddLandingPageSubmit(event) {
    event.preventDefault();
    const title = document.getElementById('lp-title')?.value.trim();
    const slug = document.getElementById('lp-slug')?.value.trim();
    const subtitle = document.getElementById('lp-subtitle')?.value.trim();
    const productTitle = document.getElementById('lp-prod-name')?.value.trim();
    const regularPrice = Number(document.getElementById('lp-regular-price')?.value) || 0;
    const salePrice = Number(document.getElementById('lp-sale-price')?.value) || 0;
    const videoUrl = document.getElementById('lp-video-url')?.value.trim();
    const bannerImage = document.getElementById('lp-banner-image')?.value.trim();
    const featuresRaw = document.getElementById('lp-features')?.value.trim();
    const features = featuresRaw ? featuresRaw.split(',').map(s => s.trim()) : [];

    try {
        const res = await fetchWithAuth('/api/admin/landing-pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, slug, subtitle, productTitle, regularPrice, salePrice, videoUrl, bannerImage, features })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Landing page published successfully!", "success");
            document.getElementById('add-landing-page-form')?.reset();
            fetchAdminLandingPages();
        } else {
            showToast(data.message || "Failed to create landing page", "error");
        }
    } catch (err) {
        showToast("Error creating landing page", "error");
    }
}

async function deleteLandingPage(id) {
    if (!confirm("Are you sure you want to delete this landing page?")) return;
    try {
        const res = await fetchWithAuth(`/api/admin/landing-pages/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast("Landing page deleted", "success");
            fetchAdminLandingPages();
        }
    } catch (err) {
        showToast("Failed to delete landing page", "error");
    }
}

// ==========================================================================
// PURCHASES & SUPPLIERS FEATURES
// ==========================================================================
let allSuppliersList = [];

async function fetchAdminSuppliers() {
    try {
        const res = await fetchWithAuth('/api/admin/suppliers');
        const data = await res.json();
        const tbody = document.getElementById('suppliers-table-body');
        const paySelect = document.getElementById('pay-supplier-select');
        const poSelect = document.getElementById('po-supplier-select');

        if (data.success && Array.isArray(data.suppliers)) {
            allSuppliersList = data.suppliers;
            if (tbody) {
                if (allSuppliersList.length > 0) {
                    tbody.innerHTML = allSuppliersList.map(s => `
                        <tr style="border-bottom:1px solid #f1f5f9;">
                            <td style="padding:10px 14px; font-weight:600; color:#0f172a;">${escapeHTML(s.name)}</td>
                            <td style="padding:10px 14px; color:#64748b;">${escapeHTML(s.phone)}</td>
                            <td style="padding:10px 14px; color:#475569;">${escapeHTML(s.company || '-')}</td>
                            <td style="padding:10px 14px; font-weight:700; color:#dc2626;">৳ ${(s.totalDue || 0).toLocaleString()}</td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">No suppliers registered yet.</td></tr>';
                }
            }

            // Populate Supplier dropdowns
            [paySelect, poSelect].forEach(sel => {
                if (sel) {
                    sel.innerHTML = '<option value="">-- Choose Supplier --</option>' + 
                        allSuppliersList.map(s => `<option value="${escapeHTML(s.name)}" data-due="${s.totalDue || 0}" data-id="${s._id}">${escapeHTML(s.name)} (${escapeHTML(s.company || s.phone)})</option>`).join('');
                }
            });
        }
    } catch (err) {
        console.error("Fetch suppliers error:", err);
    }
}

function openAddSupplierModal() {
    const modal = document.getElementById('add-supplier-modal');
    if (modal) modal.style.display = 'block';
}

function closeAddSupplierModal() {
    const modal = document.getElementById('add-supplier-modal');
    if (modal) modal.style.display = 'none';
}

async function handleAddSupplierSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('sup-name')?.value.trim();
    const phone = document.getElementById('sup-phone')?.value.trim();
    const company = document.getElementById('sup-company')?.value.trim();
    const email = document.getElementById('sup-email')?.value.trim();
    const address = document.getElementById('sup-address')?.value.trim();

    try {
        const res = await fetchWithAuth('/api/admin/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, company, email, address })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Supplier registered successfully!", "success");
            closeAddSupplierModal();
            document.getElementById('add-supplier-form')?.reset();
            fetchAdminSuppliers();
        } else {
            showToast(data.message || "Failed to add supplier", "error");
        }
    } catch (err) {
        showToast("Error adding supplier", "error");
    }
}

function openSupplierPaymentModal() {
    const modal = document.getElementById('supplier-payment-modal');
    if (modal) {
        fetchAdminSuppliers();
        modal.style.display = 'block';
    }
}

function closeSupplierPaymentModal() {
    const modal = document.getElementById('supplier-payment-modal');
    if (modal) modal.style.display = 'none';
}

function updateSupplierPaymentDueDisplay() {
    const sel = document.getElementById('pay-supplier-select');
    const dueInfo = document.getElementById('pay-supplier-due-info');
    const dueAmount = document.getElementById('pay-current-due-amount');
    if (sel && dueInfo && dueAmount) {
        const opt = sel.options[sel.selectedIndex];
        if (opt && opt.value) {
            const due = Number(opt.dataset.due) || 0;
            dueAmount.textContent = `৳ ${due.toLocaleString()}`;
            dueInfo.style.display = 'block';
        } else {
            dueInfo.style.display = 'none';
        }
    }
}

async function handleSupplierPaymentSubmit(event) {
    event.preventDefault();
    const supplierName = document.getElementById('pay-supplier-select')?.value;
    const amount = Number(document.getElementById('pay-amount')?.value) || 0;
    const method = document.getElementById('pay-method')?.value;
    const notes = document.getElementById('pay-notes')?.value.trim();

    if (!supplierName) {
        showToast("Please select a supplier", "error");
        return;
    }

    try {
        const res = await fetchWithAuth('/api/admin/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Supplier Payment: ${supplierName}`,
                category: 'Supplier Payment',
                amount: amount,
                paymentMethod: method,
                note: notes
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Recorded ৳${amount.toLocaleString()} payment for ${supplierName}`, "success");
            closeSupplierPaymentModal();
            fetchAdminSuppliers();
            fetchAdminExpenses();
        }
    } catch (e) {
        showToast("Failed to record supplier payment", "error");
    }
}

async function fetchAdminPurchases() {
    try {
        const res = await fetchWithAuth('/api/admin/purchases');
        const data = await res.json();
        const tbody = document.getElementById('purchases-table-body');
        if (!tbody) return;

        if (data.success && Array.isArray(data.purchases) && data.purchases.length > 0) {
            tbody.innerHTML = data.purchases.map(p => `
                <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:10px 14px; font-weight:600; color:#2563eb;">${escapeHTML(p.purchaseNo)}</td>
                    <td style="padding:10px 14px; color:#1e293b;">${escapeHTML(p.supplier)}</td>
                    <td style="padding:10px 14px; font-weight:700; color:#0f172a;">৳ ${(p.totalAmount || 0).toLocaleString()}</td>
                    <td style="padding:10px 14px;"><span style="background:#f0fdf4; color:#16a34a; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px;">${p.status || 'Received'}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">No purchase orders recorded yet.</td></tr>';
        }
    } catch (err) {
        console.error("Fetch purchases error:", err);
    }
}

function openAddPurchaseModal() {
    const modal = document.getElementById('add-purchase-modal');
    if (modal) {
        fetchAdminSuppliers();
        modal.style.display = 'block';
    }
}

function closeAddPurchaseModal() {
    const modal = document.getElementById('add-purchase-modal');
    if (modal) modal.style.display = 'none';
}

function calcPoTotal() {
    const qty = Number(document.getElementById('po-qty')?.value) || 1;
    const cost = Number(document.getElementById('po-unit-cost')?.value) || 0;
    const totalInput = document.getElementById('po-total-amount');
    if (totalInput) totalInput.value = qty * cost;
}

async function handleAddPurchaseSubmit(event) {
    event.preventDefault();
    const supplier = document.getElementById('po-supplier-select')?.value;
    const productName = document.getElementById('po-product-name')?.value.trim();
    const quantity = Number(document.getElementById('po-qty')?.value) || 1;
    const unitCost = Number(document.getElementById('po-unit-cost')?.value) || 0;
    const totalAmount = quantity * unitCost;
    const paidAmount = Number(document.getElementById('po-paid-amount')?.value) || 0;
    const notes = document.getElementById('po-notes')?.value.trim();

    try {
        const res = await fetchWithAuth('/api/admin/purchases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                supplier,
                items: [{ productName, quantity, unitCost, totalCost: totalAmount }],
                totalAmount,
                paidAmount,
                notes
            })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Purchase Order recorded successfully!", "success");
            closeAddPurchaseModal();
            document.getElementById('add-purchase-form')?.reset();
            fetchAdminPurchases();
            fetchAdminSuppliers();
        } else {
            showToast(data.message || "Failed to record purchase", "error");
        }
    } catch (e) {
        showToast("Error recording purchase order", "error");
    }
}

// ==========================================================================
// REPORTS & ANALYTICS FEATURES
// ==========================================================================
async function fetchAdminReports() {
    try {
        // Fetch dashboard stats & expenses
        fetchDashboardStats();
        fetchAdminExpenses();
    } catch (e) {
        console.error("Report fetch error:", e);
    }
}

// ==========================================================================
// MARKETING & PIXELS CONFIG
// ==========================================================================
async function loadMarketingSettings() {
    try {
        const res = await fetchWithAuth('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
            const s = data.settings;
            if (document.getElementById('fb-pixel-id')) document.getElementById('fb-pixel-id').value = s.fb_pixel_id || '';
            if (document.getElementById('fb-capi-token')) document.getElementById('fb-capi-token').value = s.fb_capi_token || '';
            if (document.getElementById('ga4-id')) document.getElementById('ga4-id').value = s.ga4_id || '';
            if (document.getElementById('gtm-id')) document.getElementById('gtm-id').value = s.gtm_id || '';
            if (document.getElementById('tiktok-pixel-id')) document.getElementById('tiktok-pixel-id').value = s.tiktok_pixel_id || '';
        }
    } catch (e) {
        console.error("Failed to load marketing settings", e);
    }
}

async function saveMarketingSettings(event) {
    if (event) event.preventDefault();
    const settings = {
        fb_pixel_id: document.getElementById('fb-pixel-id')?.value.trim() || '',
        fb_capi_token: document.getElementById('fb-capi-token')?.value.trim() || '',
        ga4_id: document.getElementById('ga4-id')?.value.trim() || '',
        gtm_id: document.getElementById('gtm-id')?.value.trim() || '',
        tiktok_pixel_id: document.getElementById('tiktok-pixel-id')?.value.trim() || ''
    };

    try {
        const res = await fetchWithAuth('/api/admin/settings/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Marketing pixels & tracking configuration saved!", "success");
        } else {
            showToast("Failed to save marketing pixels", "error");
        }
    } catch (e) {
        showToast("Error saving marketing pixels", "error");
    }
}

// ==========================================================================
// SHIPPING & DELIVERY CHARGES CONFIG
// ==========================================================================
async function loadShippingSettings() {
    try {
        const res = await fetchWithAuth('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
            const s = data.settings;
            const insideDhaka = document.getElementById('shipping-inside-dhaka');
            const outsideDhaka = document.getElementById('shipping-outside-dhaka');
            const subAreas = document.getElementById('shipping-sub-areas');
            const freeMin = document.getElementById('shipping-free-min');
            if (insideDhaka && s.shipping_inside_dhaka) insideDhaka.value = s.shipping_inside_dhaka;
            if (outsideDhaka && s.shipping_outside_dhaka) outsideDhaka.value = s.shipping_outside_dhaka;
            if (subAreas && s.shipping_sub_areas) subAreas.value = s.shipping_sub_areas;
            if (freeMin && s.shipping_free_min) freeMin.value = s.shipping_free_min;
        }
    } catch (e) {
        console.error("Failed to load shipping settings", e);
    }
}

async function saveShippingSettings(event) {
    if (event) event.preventDefault();
    const settings = {
        shipping_inside_dhaka: document.getElementById('shipping-inside-dhaka')?.value || '70',
        shipping_outside_dhaka: document.getElementById('shipping-outside-dhaka')?.value || '130',
        shipping_sub_areas: document.getElementById('shipping-sub-areas')?.value || '100',
        shipping_free_min: document.getElementById('shipping-free-min')?.value || '3000'
    };

    try {
        const res = await fetchWithAuth('/api/admin/settings/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });
        const data = await res.json();
        if (data.success) {
            showToast("Shipping zones and delivery rates updated!", "success");
        } else {
            showToast("Failed to update shipping rates", "error");
        }
    } catch (e) {
        showToast("Error updating shipping rates", "error");
    }
}

// ==========================================================================
// INTEGRATIONS CONFIG
// ==========================================================================
async function loadIntegrationSettings() {
    try {
        const res = await fetchWithAuth('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
            const s = data.settings;
            if (document.getElementById('steadfast-api-key')) document.getElementById('steadfast-api-key').value = s.steadfast_api_key || '';
            if (document.getElementById('steadfast-secret-key')) document.getElementById('steadfast-secret-key').value = s.steadfast_secret_key || '';
            if (document.getElementById('sms-api-key')) document.getElementById('sms-api-key').value = s.sms_api_key || '';
            if (document.getElementById('sms-sender-id')) document.getElementById('sms-sender-id').value = s.sms_sender_id || 'AVARONI';
        }
    } catch (e) {
        console.error("Failed to load integration settings", e);
    }
}

async function saveIntegrationSettings(type, event) {
    if (event) event.preventDefault();
    let settings = {};
    if (type === 'steadfast') {
        settings.steadfast_api_key = document.getElementById('steadfast-api-key')?.value || '';
        settings.steadfast_secret_key = document.getElementById('steadfast-secret-key')?.value || '';
    } else if (type === 'sms') {
        settings.sms_api_key = document.getElementById('sms-api-key')?.value || '';
        settings.sms_sender_id = document.getElementById('sms-sender-id')?.value || 'AVARONI';
    }

    try {
        const res = await fetchWithAuth('/api/admin/settings/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`${type.toUpperCase()} credentials saved successfully!`, "success");
        }
    } catch (e) {
        showToast("Error saving configuration", "error");
    }
}
"""

with open(admin_js_path, 'w', encoding='utf-8') as f:
    f.write(base_js + full_features_code)

print("Successfully updated public/admin.js with complete robust features!")
