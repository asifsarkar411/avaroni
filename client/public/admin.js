// Custom Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = "toast ${type}";
    
    const icon = type === 'success' ? '<i class="fas fa-check-circle" style="color:#28a745; margin-right:8px;"></i>' : '<i class="fas fa-exclamation-circle" style="color:#dc3545; margin-right:8px;"></i>';
    toast.innerHTML = icon + message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.5s ease reverse forwards';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
// Helper function to format image URLs safely
function formatImageUrl(url) {
    if (!url || typeof url !== 'string' || !url.trim()) {
        return './img/profile_image.jpg';
    }
    let clean = url.trim().replace(/\\/g, '/');
    if (clean.startsWith('data:image/')) return clean;
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (!clean.startsWith('/') && !clean.startsWith('./')) {
        clean = '/' + clean;
    }
    return clean;
}

// Global HTML Escaper function to prevent XSS attacks
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let addProdDescEditor = null;
let editProdDescEditor = null;

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('add-prod-desc-editor')) {
        addProdDescEditor = new Quill('#add-prod-desc-editor', {
            theme: 'snow',
            modules: { toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline'], ['link', 'image'], [{'list': 'ordered'}, {'list': 'bullet'}], ['clean']] },
            placeholder: 'Write product description here...'
        });
    }
    if (document.getElementById('edit-prod-desc-editor')) {
        editProdDescEditor = new Quill('#edit-prod-desc-editor', {
            theme: 'snow',
            modules: { toolbar: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline'], ['link', 'image'], [{'list': 'ordered'}, {'list': 'bullet'}], ['clean']] },
            placeholder: 'Write product description here...'
        });
    }

    // 1. Check if user is logged in
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
        return; // Important: Stops the rest of the script from running if not logged in
    } else {
        // Run validation and initial dashboard fetches
        showDashboard().catch(err => console.error('Dashboard init error:', err));
        
        // Restore tab
        const savedTab = localStorage.getItem('activeAdminTab') || 'dashboard';
        switchTab(savedTab);
    }


    // 2. Attach Static Event Listeners
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) addCardBtn.addEventListener('click', createNewCard);

    // 2b. Initialize Mobile Sidebar Drawer Navigation
    initMobileAdminSidebar();

    // 3. Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const btn = event.target.closest('.tab-btn');
            if (!btn) return;
            const targetTab = btn.getAttribute('data-target');
            if (targetTab) switchTab(targetTab);
        });
    });

    // 4. Add Product Form Submit
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // 5. Add Category Form Submit
    const addCategoryForm = document.getElementById('add-category-form');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', handleAddCategory);
    }

    // 6. Dynamic Category -> Subcategory selection binding
    const prodCategorySelect = document.getElementById('prod-category');
    if (prodCategorySelect) {
        prodCategorySelect.addEventListener('change', (e) => {
            populateSubcategories(e.target.value);
        });
    }

    // 7. Add Promo Code Form Submit
    const addPromoForm = document.getElementById('add-promo-form');
    if (addPromoForm) {
        addPromoForm.addEventListener('submit', handleAddPromoCode);
    }

    // 8. Edit Product Form Submit
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProductSubmit);
    }

    // 10. Edit Category Form Submit
    const editCategoryForm = document.getElementById('edit-category-form');
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', handleEditCategorySubmit);
    }

    const editCategorySelect = document.getElementById('edit-prod-category');
    if (editCategorySelect) {
        editCategorySelect.addEventListener('change', (e) => {
            populateEditSubcategories(e.target.value);
        });
    }

    // Category Creation Live Icon Preview
    const newCatFile = document.getElementById('new-cat-icon-file');
    const newCatUrl = document.getElementById('new-cat-icon-url');
    const newCatPreviewWrapper = document.getElementById('cat-icon-preview-wrapper');
    const newCatPreviewImg = document.getElementById('cat-icon-preview-img');
    const newCatClearBtn = document.getElementById('cat-clear-icon-btn');

    if (newCatFile) {
        newCatFile.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const base64 = await fileToBase64(e.target.files[0]);
                if (newCatPreviewImg) newCatPreviewImg.src = base64;
                if (newCatPreviewWrapper) newCatPreviewWrapper.style.display = 'flex';
                if (newCatUrl) newCatUrl.value = '';
            }
        });
    }

    if (newCatUrl) {
        newCatUrl.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) {
                if (newCatPreviewImg) newCatPreviewImg.src = val;
                if (newCatPreviewWrapper) newCatPreviewWrapper.style.display = 'flex';
            } else if (!newCatFile || !newCatFile.files || !newCatFile.files[0]) {
                if (newCatPreviewWrapper) newCatPreviewWrapper.style.display = 'none';
            }
        });
    }

    if (newCatClearBtn) {
        newCatClearBtn.addEventListener('click', () => {
            if (newCatFile) newCatFile.value = '';
            if (newCatUrl) newCatUrl.value = '';
            if (newCatPreviewImg) newCatPreviewImg.src = '';
            if (newCatPreviewWrapper) newCatPreviewWrapper.style.display = 'none';
        });
    }

    // Category Live Search Filter
    const catSearchInput = document.getElementById('cat-search-input');
    if (catSearchInput) {
        catSearchInput.addEventListener('input', (e) => {
            filterCategories(e.target.value.trim().toLowerCase());
        });
    }

    // Edit Category Modal live icon preview
    const editCatFile = document.getElementById('edit-cat-icon-file');
    const editCatUrl = document.getElementById('edit-cat-icon-url');
    const editCatPreview = document.getElementById('edit-cat-icon-preview');

    if (editCatFile) {
        editCatFile.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const base64 = await fileToBase64(e.target.files[0]);
                if (editCatPreview) editCatPreview.src = base64;
            }
        });
    }

    if (editCatUrl) {
        editCatUrl.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val && editCatPreview) {
                editCatPreview.src = val;
            }
        });
    }

    // 10. Settings & User Forms Submit
    const changeEmailForm = document.getElementById('change-email-form');
    if (changeEmailForm) changeEmailForm.addEventListener('submit', handleChangeEmail);

    const brandLogoForm = document.getElementById('brand-logo-form');
    if (brandLogoForm) brandLogoForm.addEventListener('submit', handleChangeBrandLogo);

    const brandNameForm = document.getElementById('brand-name-form');
    if (brandNameForm) brandNameForm.addEventListener('submit', handleChangeBrandName);

    const marqueeForm = document.getElementById('marquee-settings-form');
    if (marqueeForm) marqueeForm.addEventListener('submit', handleChangeMarqueeSettings);

    const marqueeTextInput = document.getElementById('marquee-text-input');
    if (marqueeTextInput) {
        marqueeTextInput.addEventListener('input', (e) => {
            const previewText = document.getElementById('preview-marquee-text');
            if (previewText) previewText.textContent = e.target.value || '✨ Marquee Announcement Preview ✨';
        });
    }

    const popupForm = document.getElementById('popup-settings-form');
    if (popupForm) popupForm.addEventListener('submit', handleChangePopupSettings);

    const popupFileInput = document.getElementById('popup-image-input');
    if (popupFileInput) {
        popupFileInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const base64 = await fileToBase64(e.target.files[0]);
                const previewImg = document.getElementById('popup-preview-img');
                const previewContainer = document.getElementById('popup-preview-container');
                const noImgText = document.getElementById('popup-no-img-text');
                if (previewImg) previewImg.src = base64;
                if (previewContainer) previewContainer.style.display = 'block';
                if (noImgText) noImgText.style.display = 'none';
            }
        });
    }

    const popupUrlInput = document.getElementById('popup-image-url-input');
    if (popupUrlInput) {
        popupUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url) {
                const previewImg = document.getElementById('popup-preview-img');
                const previewContainer = document.getElementById('popup-preview-container');
                const noImgText = document.getElementById('popup-no-img-text');
                if (previewImg) previewImg.src = url;
                if (previewContainer) previewContainer.style.display = 'block';
                if (noImgText) noImgText.style.display = 'none';
            }
        });
    }

    const removePopupBtn = document.getElementById('remove-popup-btn');
    if (removePopupBtn) removePopupBtn.addEventListener('click', handleRemovePopupImage);

    const changePassForm = document.getElementById('change-password-form');
    if (changePassForm) changePassForm.addEventListener('submit', handleChangePassword);

    const createUserForm = document.getElementById('create-user-form');
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);

    document.querySelectorAll('.tags-input').forEach(el => {
        el._tagsInput = new TagsInput(el);
    });
});

// Helper to convert & compress image file to optimized Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            // Fallback for non-standard image types
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const maxDim = 1200; // Max 1200px dimension for studio clarity
                let width = img.width;
                let height = img.height;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress image to 0.82 quality JPEG for super fast network transfer
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
                resolve(compressedBase64);
            };
            img.onerror = () => resolve(event.target.result); // Fallback if image load fails
        };
        reader.onerror = error => reject(error);
    });
}

// Helper function to get auth headers securely
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Authorization': `Bearer ${token}`
    };
}

// Wrapper around fetch that automatically handles expired/invalid token sessions (401/403)
async function fetchWithAuth(url, options = {}) {
    const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
    };
    
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('adminToken');
            showToast("Your session has expired or is invalid. Please log in again.", 'error');
            window.location.href = 'admin-login.html';
            return null;
        }
        return response;
    } catch (err) {
        console.error("Network or fetch error:", err);
        throw err;
    }
}

// ==========================================
// CORE FUNCTIONS
// ==========================================

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html'; 
}

async function showDashboard() {
    // Validate session token on startup before fetching stats
    const res = await fetchWithAuth('/api/user-data');
    if (res && res.ok) {
        fetchDashboardStats();
        fetchAnalyticsCharts();
        fetchDashboardVisuals(); // Load new visual charts + tables
        fetchManageProducts(); // For low stock card
        fetchSettings();
    }
}

async function fetchSettings() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success && data.settings) {
            if (data.settings.brandLogo) {
                const logoPreview = document.getElementById('current-brand-logo-preview');
                if (logoPreview) logoPreview.src = data.settings.brandLogo;
                updateFavicon(data.settings.brandLogo);
            }
            if (data.settings.brandName) {
                const nameInput = document.getElementById('brand-name-input');
                if (nameInput) nameInput.value = data.settings.brandName;
            }
            if (data.settings.marqueeText !== undefined) {
                const marqueeInput = document.getElementById('marquee-text-input');
                const previewText = document.getElementById('preview-marquee-text');
                if (marqueeInput) marqueeInput.value = data.settings.marqueeText;
                if (previewText) previewText.textContent = data.settings.marqueeText;
            }
            if (data.settings.marqueeEnabled !== undefined) {
                const marqueeEnabled = document.getElementById('marquee-enabled-input');
                if (marqueeEnabled) marqueeEnabled.checked = (data.settings.marqueeEnabled === 'true' || data.settings.marqueeEnabled === true);
            }
            if (data.settings.marqueeSpeed) {
                const marqueeSpeed = document.getElementById('marquee-speed-select');
                if (marqueeSpeed) marqueeSpeed.value = data.settings.marqueeSpeed;
            }
            if (data.settings.popupImage) {
                const previewImg = document.getElementById('popup-preview-img');
                const previewContainer = document.getElementById('popup-preview-container');
                const noImgText = document.getElementById('popup-no-img-text');
                const urlInput = document.getElementById('popup-image-url-input');
                if (previewImg) previewImg.src = data.settings.popupImage;
                if (previewContainer) previewContainer.style.display = 'block';
                if (noImgText) noImgText.style.display = 'none';
                if (urlInput && !data.settings.popupImage.startsWith('data:')) {
                    urlInput.value = data.settings.popupImage;
                }
            } else {
                const previewContainer = document.getElementById('popup-preview-container');
                const noImgText = document.getElementById('popup-no-img-text');
                if (previewContainer) previewContainer.style.display = 'none';
                if (noImgText) noImgText.style.display = 'block';
            }
            if (data.settings.popupEnabled !== undefined) {
                const popupEnabled = document.getElementById('popup-enabled-input');
                if (popupEnabled) popupEnabled.checked = (data.settings.popupEnabled === 'true' || data.settings.popupEnabled === true);
            }
            if (data.settings.popupLink !== undefined) {
                const popupLink = document.getElementById('popup-link-input');
                if (popupLink) popupLink.value = data.settings.popupLink;
            }
        }
    } catch (err) {
        console.error("Error fetching settings:", err);
    }
}

function updateFavicon(iconUrl) {
    if (!iconUrl) return;
    let favicon = document.querySelector("link[rel='icon'], link[rel='shortcut icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.type = 'image/png';
    favicon.href = iconUrl;
}

let chartInstances = {};

function destroyChart(canvasId) {
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }
}

async function fetchDashboardStats() {
    try {
        const response = await fetchWithAuth('/api/admin/dashboard-stats');
        if (!response) return;
        const data = await response.json();
        
        if (data.success && data.stats) {
            const countOrders = document.getElementById('count-orders');
            const countProducts = document.getElementById('count-products');
            const countBanners = document.getElementById('count-banners');
            const countSliders = document.getElementById('count-sliders');
            const countReturns = document.getElementById('count-returns');
            const countMessages = document.getElementById('count-messages');
            const totalRevenue = document.getElementById('total-revenue');
            const totalExpense = document.getElementById('total-expense');
            const totalProfit = document.getElementById('total-profit');

            if (countOrders) countOrders.innerText = data.stats.ordersCount || 0;
            if (countProducts) countProducts.innerText = data.stats.productsCount || 0;
            if (countBanners) countBanners.innerText = data.stats.bannersCount || 0;
            if (countSliders) countSliders.innerText = data.stats.slidersCount || 0;
            if (countReturns) countReturns.innerText = data.stats.returnsCount || 0;
            if (countMessages) countMessages.innerText = data.stats.messagesCount || 0;
            if (totalRevenue) totalRevenue.innerText = Number(data.stats.totalRevenue || 0).toLocaleString();
            if (totalExpense) totalExpense.innerText = Number(data.stats.totalExpense || 0).toLocaleString();
            if (totalProfit) totalProfit.innerText = Number(data.stats.totalProfit || 0).toLocaleString();
        }
    } catch (err) {
        console.error("Error loading dashboard stats:", err);
    }
}

async function fetchAnalyticsCharts() {
    if (typeof Chart === 'undefined') return;

    try {
        const response = await fetchWithAuth('/api/admin/analytics');
        if (!response) return;
        const data = await response.json();
        if (!data.success || !data.analytics) return;

        const analytics = data.analytics;

        // 1. Order Overview (Doughnut)
        const ctx1 = document.getElementById('orderOverviewChart');
        if (ctx1) {
            destroyChart('orderOverviewChart');
            const overviewData = analytics.orderOverview || {};
            const labels = Object.keys(overviewData);
            const values = Object.values(overviewData);
            
            const colorMap = {
                'Pending': '#ffc107',
                'Processing': '#17a2b8',
                'Approved': '#28a745',
                'Cancelled': '#dc3545'
            };
            const backgroundColors = labels.map(l => colorMap[l] || '#6c757d');

            chartInstances['orderOverviewChart'] = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: backgroundColors,
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const val = context.parsed || 0;
                                    return ` ${label}: ${val} orders`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // 2. Monthly Sales Trend (Line)
        const ctx2 = document.getElementById('monthlySalesChart');
        if (ctx2) {
            destroyChart('monthlySalesChart');
            chartInstances['monthlySalesChart'] = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: analytics.monthlySalesTrend.labels,
                    datasets: [{
                        label: 'Sales (৳)',
                        data: analytics.monthlySalesTrend.data,
                        borderColor: '#e60050',
                        backgroundColor: 'rgba(230, 0, 80, 0.1)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 5,
                        pointBackgroundColor: '#e60050'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // 3. Monthly Payment Record (Bar)
        const ctx3 = document.getElementById('paymentRecordChart');
        if (ctx3) {
            destroyChart('paymentRecordChart');
            chartInstances['paymentRecordChart'] = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: analytics.paymentRecord.labels,
                    datasets: [{
                        label: 'Revenue (৳)',
                        data: analytics.paymentRecord.data,
                        backgroundColor: ['#0d6efd', '#d63384', '#6f42c1', '#fd7e14', '#198754'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // 4. Top Selling Products (Horizontal Bar)
        const ctx4 = document.getElementById('topProductsChart');
        if (ctx4) {
            destroyChart('topProductsChart');
            const hasData = analytics.topSellingProducts.labels.length > 0;
            chartInstances['topProductsChart'] = new Chart(ctx4, {
                type: 'bar',
                data: {
                    labels: hasData ? analytics.topSellingProducts.labels : ['No Sales Yet'],
                    datasets: [{
                        label: 'Quantity Sold',
                        data: hasData ? analytics.topSellingProducts.data : [0],
                        backgroundColor: '#6f42c1',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { beginAtZero: true }
                    }
                }
            });
        }

    } catch (err) {
        console.error("Error loading analytics charts:", err);
    }
}

function initMobileAdminSidebar() {
    const toggleBtn = document.getElementById('admin-menu-toggle');
    const closeBtn = document.getElementById('admin-sidebar-close');
    const sidebar = document.getElementById('admin-sidebar') || document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    const tabBtns = document.querySelectorAll('.sidebar-nav .tab-btn');
    const logoutBtn = document.getElementById('logout-btn');

    function openSidebarDrawer() {
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    function closeSidebarDrawer() {
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && sidebar.classList.contains('active')) {
                closeSidebarDrawer();
            } else {
                openSidebarDrawer();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebarDrawer);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebarDrawer);
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 991) {
                closeSidebarDrawer();
            }
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.innerWidth <= 991) {
                closeSidebarDrawer();
            }
        });
    }
}

function switchTab(tabName) {
    localStorage.setItem('activeAdminTab', tabName);
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const targetBtn = document.querySelector(`button[data-target="${tabName}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) targetTab.classList.add('active');

    // Update Topbar Title
    const titleElement = document.getElementById('tab-title');
    if (titleElement) {
        let cleanTitle = "Dashboard Overview";
        if (tabName === 'orders') cleanTitle = "Customer Orders";
        if (tabName === 'manage-products') cleanTitle = "Manage Inventory";
        if (tabName === 'add-product') cleanTitle = "Add New Product";
        if (tabName === 'manage-categories') cleanTitle = "Manage Categories";
        if (tabName === 'manage-promocodes') cleanTitle = "Manage Promocodes";
        if (tabName === 'manage-banners') cleanTitle = "Manage Homepage Slider";
        if (tabName === 'manage-popup') cleanTitle = "Homepage Welcome Popup Banner";
        if (tabName === 'manage-returns') cleanTitle = "Customer Return Requests";
        if (tabName === 'manage-messages') cleanTitle = "Customer Contact Messages";
        if (tabName === 'manage-customers') cleanTitle = "Customer Accounts Management";
        if (tabName === 'manage-reviews') cleanTitle = "Customer Reviews & Ratings";
        if (tabName === 'user-tracking') cleanTitle = "User Activity Tracking & Analytics";
        if (tabName === 'manage-flash-sale') cleanTitle = "Flash Sale Countdown Timer";
        if (tabName === 'manage-blogs') cleanTitle = "Manage Blogs";
        if (tabName === 'admin-settings') cleanTitle = "Settings & Admin User Access";
        titleElement.innerText = cleanTitle;
    }

    // Fetch data dynamically based on the active tab
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
}

// Navigate to Orders tab with a specific filter pre-selected
function goToOrdersTab(filterStatus) {
    activeOrderFilterStatus = filterStatus || 'ALL';
    currentOrdersPage = 1;
    switchTab('orders');
    // After tab switch, highlight the correct filter pill
    setTimeout(() => {
        const filterBtns = document.querySelectorAll('.order-filter-btn');
        filterBtns.forEach(b => {
            b.classList.remove('active');
            if ((b.dataset.status || 'ALL') === filterStatus) b.classList.add('active');
        });
        renderFilteredOrders();
    }, 100);
}

// ==========================================
// DYNAMIC EVENT DELEGATORS
// ==========================================

let currentInventoryProducts = [];

const manageTableBody = document.getElementById('manage-table-body');
if (manageTableBody) {
    manageTableBody.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button');
        if (!targetBtn) return;

        if (targetBtn.classList.contains('edit-btn')) {
            openEditModal(targetBtn.getAttribute('data-id'));
        } else if (targetBtn.classList.contains('toggle-btn')) {
            toggleAvailability(targetBtn.getAttribute('data-id'));
        } else if (targetBtn.classList.contains('delete-btn')) {
            deleteProduct(targetBtn.getAttribute('data-id'));
        }
    });
}

const adminCardsContainer = document.getElementById('admin-cards-container');
if (adminCardsContainer) {
    adminCardsContainer.addEventListener('click', (e) => {
        const delCard = e.target.closest('.delete-card-btn');
        const saveHeading = e.target.closest('.save-heading-btn');
        const delImg = e.target.closest('.delete-img-btn');

        if (delCard) {
            deleteCard(delCard.getAttribute('data-id'));
        } else if (saveHeading) {
            updateCardHeading(saveHeading.getAttribute('data-id'));
        } else if (delImg) {
            deleteImageFromCard(delImg.getAttribute('data-card-id'), delImg.getAttribute('data-img-index'));
        }
    });

    adminCardsContainer.addEventListener('change', async (e) => {
        if (e.target.classList.contains('slider-file-input')) {
            const cardId = e.target.getAttribute('data-card-id');
            const previewBox = document.getElementById(`preview-box-${cardId}`);
            const previewImg = document.getElementById(`preview-img-${cardId}`);
            if (e.target.files && e.target.files[0]) {
                const base64 = await fileToBase64(e.target.files[0]);
                if (previewImg) previewImg.src = base64;
                if (previewBox) previewBox.style.display = 'flex';
            }
        }
    });

    adminCardsContainer.addEventListener('submit', (e) => {
        const form = e.target.closest('.upload-image-form');
        if (form) {
            e.preventDefault();
            uploadImageToCard(form.getAttribute('data-id'));
        }
    });
}

// ==========================================
// INVENTORY MANAGEMENT
// ==========================================

async function fetchManageProducts() {
    try {
        const response = await fetchWithAuth('/api/admin/products');
        if (!response) return;
        const data = await response.json();
        const tbody = document.getElementById('manage-table-body');
        
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!data.success || !data.products) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Failed to load products.</td></tr>';
            return;
        }

        currentInventoryProducts = data.products;
        renderLowStockCard(data.products);

        if (data.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No products in inventory.</td></tr>';
            return;
        }

        data.products.forEach(prod => {
            const imgUrl = formatImageUrl(prod.imageUrl);
            tbody.innerHTML += `
                <tr class="table-row-hover">
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${imgUrl}" onerror="this.onerror=null; this.src='./img/profile_image.jpg';" width="48" height="48" style="object-fit:cover; border-radius:8px; border: 1px solid #e2e8f0;">
                            <span style="font-weight:600; color:#1e293b;">${escapeHTML(prod.name)}</span>
                        </div>
                    </td>
                    <td><span style="color:#64748b; font-size:13px; font-weight:500;">${escapeHTML(prod.category)}</span></td>
                    <td><span style="color:#64748b; font-size:13px;">${escapeHTML(prod.size || '-')}</span></td>
                    <td><span style="color:#64748b; font-size:13px;">${escapeHTML(prod.colour || '-')}</span></td>
                    <td><span style="color:#64748b; font-size:13px;">${escapeHTML(prod.brand || '-')}</span></td>
                    <td style="font-weight:700; color:#0f172a;">৳${prod.price}</td>
                    <td>
                        <span style="font-size:13px; font-weight:600; color:${prod.discountType === 'none' || !prod.discountType ? '#94a3b8' : '#ef4444'};">
                            ${!prod.discountType || prod.discountType === 'none' ? '-' : (prod.discountType === 'percentage' ? prod.discountValue + '%' : '৳' + prod.discountValue)}
                        </span>
                    </td>
                    <td>
                        <span style="font-size:13px; font-weight:600; color:${prod.stockQuantity > 5 ? '#10b981' : '#f59e0b'};">
                            ${prod.stockQuantity} in stock
                        </span>
                    </td> 
                    <td>
                        ${prod.isAvailable 
                            ? '<span class="badge badge-success">Available</span>' 
                            : '<span class="badge badge-danger">Hidden</span>'}
                    </td>
                    <td>
                        <div class="table-action-btns">
                            <button data-id="${prod._id}" class="btn-icon btn-icon-primary edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                            <button data-id="${prod._id}" class="btn-icon btn-icon-secondary toggle-btn" title="Hide/Show"><i class="fas fa-eye-slash"></i></button>
                            <button data-id="${prod._id}" class="btn-icon btn-icon-danger delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch(err) {
        console.error("Error fetching products:", err);
    }
}

async function toggleAvailability(id) {
    try {
        await fetchWithAuth(`/api/admin/products/${id}/toggle`, { 
            method: 'PATCH'
        });
        fetchManageProducts();
    } catch(err) {
        console.error("Error toggling availability:", err);
    }
}

async function deleteProduct(id) {
    if (!id || id === 'undefined') {
        showToast("Invalid product ID", 'error');
        return;
    }
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            const response = await fetchWithAuth(`/api/admin/products/${id}`, { 
                method: 'DELETE'
            });
            if (!response) return;
            const data = await response.json();
            if (response.ok && data.success) {
                fetchManageProducts();
                fetchDashboardStats();
                fetchAnalyticsCharts();
            } else {
                showToast("Failed to delete product: " + (data.message || "Unknown error", 'error'));
            }
        } catch(err) {
            console.error("Error deleting product:", err);
            showToast("Network error deleting product.", 'error');
        }
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-product-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';
    
    const imageFile = document.getElementById('prod-image').files[0];
    let imageBase64 = "";
    
    if (!imageFile) {
        showToast("Please select a product photo before saving.", 'error');
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product to Database';
        return;
    }

    try {
        imageBase64 = await fileToBase64(imageFile);
    } catch (err) {
        console.error("Error reading image:", err);
        showToast("Failed to read image file. Please try a different photo.", 'error');
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product to Database';
        return;
    }

    const payload = {
        name: document.getElementById('prod-name').value,
        buyingPrice: document.getElementById('prod-buying-price') ? document.getElementById('prod-buying-price').value : 0,
        price: document.getElementById('prod-price').value,
        category: document.getElementById('prod-category').value,
        subcategory: document.getElementById('prod-subcategory').value,
        size: document.getElementById('prod-size') ? document.getElementById('prod-size').value : '',
        colour: document.getElementById('prod-colour') ? document.getElementById('prod-colour').value : '',
        brand: document.getElementById('prod-brand') ? document.getElementById('prod-brand').value : '',
        description: addProdDescEditor ? addProdDescEditor.root.innerHTML : '',
        stock: document.getElementById('prod-stock').value,
        discountType: document.getElementById('prod-discount-type') ? document.getElementById('prod-discount-type').value : 'none',
        discountValue: document.getElementById('prod-discount-value') ? document.getElementById('prod-discount-value').value : 0,
        image: imageBase64
    };

    try {
        const response = await fetchWithAuth('/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Product added successfully!');
            document.getElementById('add-product-form').reset();
            ['prod-size', 'prod-colour'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el._tagsInput) el._tagsInput.syncFromOriginal();
            });
            if (addProdDescEditor) { addProdDescEditor.root.innerHTML = ''; }
            fetchManageProducts(); // Refresh the list instantly
        } else {
            showToast('Failed to save product: ' + (data.message || 'Unknown error', 'error'));
        }
    } catch (err) {
        console.error("Error saving product:", err);
        showToast("An error occurred connecting to the server.", 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product to Database';
    }
}

// ==========================================
// ORDER MANAGEMENT
// ==========================================

let allAdminOrders = [];
let activeOrderFilterStatus = 'ALL';
let currentOrdersPage = 1;
let ordersPerPage = 10;

async function fetchOrders() {
    try {
        const response = await fetch('/api/admin/orders', {
            headers: getAuthHeaders()
        });
        
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        if (response.status === 401 || response.status === 403) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Unauthorized: Please log out and log back in.</td></tr>';
            return;
        }

        const data = await response.json();
        allAdminOrders = data.orders || [];

        // Update counts
        updateOrderCounts(allAdminOrders);

        // Attach listeners once
        initOrderFilterListeners();

        // Render filtered view
        renderFilteredOrders();
        
        // Render advanced dashboard visuals
        if(typeof renderAdvancedVisuals === 'function') {
            renderAdvancedVisuals(allAdminOrders);
        }

    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

function updateOrderCounts(orders) {
    const counts = { ALL: orders.length, Pending: 0, Approved: 0, Processing: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach(o => {
        const st = o.status || 'Pending';
        if (counts[st] !== undefined) counts[st]++;
    });

    ['all','pending','approved','processing','delivered','cancelled'].forEach(key => {
        const el = document.getElementById(`cnt-${key}`);
        if (el) el.textContent = counts[key === 'all' ? 'ALL' : key.charAt(0).toUpperCase() + key.slice(1)];
    });
}

function initOrderFilterListeners() {
    const searchInput = document.getElementById('order-search-input');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.dataset.listener = 'true';
        searchInput.addEventListener('input', () => {
            currentOrdersPage = 1;
            renderFilteredOrders();
        });
    }

    const perPageSelect = document.getElementById('pag-per-page');
    if (perPageSelect && !perPageSelect.dataset.listener) {
        perPageSelect.dataset.listener = 'true';
        perPageSelect.addEventListener('change', (e) => {
            ordersPerPage = parseInt(e.target.value) || 10;
            currentOrdersPage = 1;
            renderFilteredOrders();
        });
    }

    const filterBtns = document.querySelectorAll('.order-filter-btn');
    filterBtns.forEach(btn => {
        if (!btn.dataset.listener) {
            btn.dataset.listener = 'true';
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                activeOrderFilterStatus = btn.dataset.status || 'ALL';
                currentOrdersPage = 1;
                renderFilteredOrders();
            });
        }
    });
}

function renderFilteredOrders() {
    const tbody = document.getElementById('orders-table-body');
    const cardsContainer = document.getElementById('mobile-orders-cards');
    const searchInput = document.getElementById('order-search-input');
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    let filtered = allAdminOrders;

    if (activeOrderFilterStatus !== 'ALL') {
        filtered = filtered.filter(o => (o.status || 'Pending').toLowerCase() === activeOrderFilterStatus.toLowerCase());
    }

    if (query) {
        filtered = filtered.filter(o => {
            const num = (o.orderNumber || '').toLowerCase();
            const name = (o.customerName || '').toLowerCase();
            const phone = (o.phone || '').toLowerCase();
            const email = (o.email || '').toLowerCase();
            const trx = (o.transactionId || '').toLowerCase();
            return num.includes(query) || name.includes(query) || phone.includes(query) || email.includes(query) || trx.includes(query);
        });
    }

    const totalOrders = filtered.length;
    const totalPages = Math.ceil(totalOrders / ordersPerPage) || 1;

    if (currentOrdersPage > totalPages) currentOrdersPage = totalPages;
    if (currentOrdersPage < 1) currentOrdersPage = 1;

    const startIndex = (currentOrdersPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, totalOrders);

    const pageOrders = filtered.slice(startIndex, endIndex);

    // Update Pagination Controls UI
    updatePaginationUI(startIndex + 1, endIndex, totalOrders, totalPages);

    if (!tbody) return;
    tbody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';

    if (pageOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 20px;">No matching orders found.</td></tr>';
        if (cardsContainer) cardsContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: #888;">No matching orders found.</div>';
        return;
    }

    pageOrders.forEach(order => {
        const date = new Date(order.orderDate).toLocaleString();
        const itemsList = (order.cartItems || []).map(item => `${item.name} (x${item.quantity})`).join(', ');
        const displayOrderNum = order.orderNumber || 'N/A'; 
        const orderStatus = order.status || 'Pending';
        let statusBadge = `<span class="badge badge-warning">Pending</span>`;
        if (orderStatus === 'Processing') {
            statusBadge = `<span class="badge badge-primary" style="background:#dbeafe; color:#1e40af;">Processing</span>`;
        } else if (orderStatus === 'Approved') {
            statusBadge = `<span class="badge badge-success">Approved</span>`;
        } else if (orderStatus === 'Delivered') {
            statusBadge = `<span class="badge badge-success" style="background:#bbf7d0; color:#166534;">Delivered</span>`;
        } else if (orderStatus === 'Cancelled') {
            statusBadge = `<span class="badge badge-danger">Cancelled</span>`;
        }

        const statusSelectHtml = `
            <select onchange="handleOrderStatusDropdownChange(this, '${order._id}', '${orderStatus}')" class="order-status-select" style="padding:4px 8px; font-size:12px; border-radius:6px; border:1px solid #e2e8f0; outline:none; background:#f8fafc; color:#475569; font-weight:500; cursor:pointer;">
                <option value="Pending" ${orderStatus === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="Approved" ${orderStatus === 'Approved' ? 'selected' : ''}>✅ Approved</option>
                <option value="Processing" ${orderStatus === 'Processing' ? 'selected' : ''}>⚙️ Processing</option>
                <option value="Delivered" ${orderStatus === 'Delivered' ? 'selected' : ''}>📦 Delivered</option>
                <option value="Cancelled" ${orderStatus === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
            </select>
        `;

        // 1. Desktop Table Row
        tbody.innerHTML += `
            <tr class="table-row-hover">
                <td><span style="color:#64748b; font-size:13px;">${date}</span></td>
                <td><span style="color:#3b82f6; font-weight:700;">${escapeHTML(displayOrderNum)}</span></td> 
                <td><div style="font-weight:600; color:#1e293b;">${escapeHTML(order.customerName)}</div></td>
                <td>
                    <div style="color:#475569; font-size:13px; font-weight:500;">${escapeHTML(order.phone)}</div>
                    <div style="color:#94a3b8; font-size:12px;">${escapeHTML(order.email)}</div>
                </td>
                <td><span style="color:#64748b; font-size:13px;">${escapeHTML(order.address)}</span></td>
                <td><span style="font-family:monospace; font-size:12px; color:#64748b; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${escapeHTML(order.transactionId || 'N/A')}</span></td>
                <td style="font-weight:700; color:#0f172a;">৳${order.totalAmount}</td>
                <td><span style="color:#64748b; font-size:12px; max-width:150px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsList}">${itemsList}</span></td>
                <td>${statusBadge}</td>
                <td style="white-space:nowrap;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${statusSelectHtml}
                        <a href="invoice.html?orderNumber=${escapeHTML(order.orderNumber)}" target="_blank" class="btn-icon btn-icon-secondary" title="View Invoice" style="color: #475569; text-decoration: none; display: flex; align-items: center; justify-content: center;"><i class="fas fa-external-link-alt"></i></a>
                        <button onclick="downloadInvoice('${escapeHTML(order.orderNumber)}')" class="btn-icon btn-icon-secondary" title="Download Invoice"><i class="fas fa-file-invoice"></i></button>
                        <button onclick="deleteOrder('${order._id}')" class="btn-icon btn-icon-danger" title="Delete Order"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;

        // 2. Mobile Responsive Card
        if (cardsContainer) {
            cardsContainer.innerHTML += `
                <div class="mobile-order-card" style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                        <div>
                            <span style="font-size: 11px; color: #888; text-transform: uppercase;">Order ID</span>
                            <div style="font-weight: 800; color: #007bff; font-size: 15px;">${escapeHTML(displayOrderNum)}</div>
                        </div>
                        <div>${statusBadge}</div>
                    </div>
                    <div style="font-size: 13px; color: #555; margin-bottom: 8px;">
                        <strong>${escapeHTML(order.customerName)}</strong> &bull; ${escapeHTML(order.phone)}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; background: #fafafa; padding: 8px; border-radius: 6px; border: 1px solid #eee;">
                        <i class="fas fa-map-marker-alt" style="color: #e60050;"></i> ${escapeHTML(order.address)}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0; font-size: 13px;">
                        <span>Payment: <strong>${escapeHTML(order.paymentMethod === 'cod' ? 'COD' : 'bKash')}</strong> (TxID: ${escapeHTML(order.transactionId || 'N/A')})</span>
                        <span style="font-size: 16px; font-weight: 800; color: #e60050;">৳${order.totalAmount}</span>
                    </div>
                    <div style="font-size: 12px; color: #444; margin-bottom: 12px; background: #fafafa; padding: 8px; border-radius: 6px; border: 1px solid #eee;">
                        <strong>Items:</strong> ${itemsList}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
                        <div style="display: flex; gap: 5px;">
                            <a href="invoice.html?orderNumber=${escapeHTML(order.orderNumber)}" target="_blank" class="btn-invoice-sm" style="background:#f1f5f9; color:#475569; text-decoration:none;" title="View Invoice"><i class="fas fa-external-link-alt"></i> View</a>
                            <button onclick="downloadInvoice('${escapeHTML(order.orderNumber)}')" class="btn-invoice-sm" title="Download Invoice"><i class="fas fa-file-invoice"></i> DL</button>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            ${statusSelectHtml}
                            <button onclick="deleteOrder('${order._id}')" class="btn-icon btn-icon-danger" style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;" title="Delete Order"><i class="fas fa-trash" style="font-size: 12px;"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }
    });
}

function updatePaginationUI(start, end, total, totalPages) {
    const startEl = document.getElementById('pag-start');
    const endEl = document.getElementById('pag-end');
    const totalEl = document.getElementById('pag-total');
    const buttonsContainer = document.getElementById('pag-buttons');

    if (startEl) startEl.textContent = total === 0 ? 0 : start;
    if (endEl) endEl.textContent = end;
    if (totalEl) totalEl.textContent = total;

    if (!buttonsContainer) return;
    buttonsContainer.innerHTML = '';

    if (total <= ordersPerPage) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentOrdersPage === 1;
    prevBtn.style.cssText = 'padding: 6px 12px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 13px;' + (currentOrdersPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : '');
    prevBtn.onclick = () => {
        if (currentOrdersPage > 1) {
            currentOrdersPage--;
            renderFilteredOrders();
        }
    };
    buttonsContainer.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        const isActive = i === currentOrdersPage;
        pageBtn.style.cssText = `padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid ${isActive ? '#111' : '#ccc'}; background: ${isActive ? '#111' : '#fff'}; color: ${isActive ? '#fff' : '#333'};`;
        pageBtn.onclick = () => {
            currentOrdersPage = i;
            renderFilteredOrders();
        };
        buttonsContainer.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentOrdersPage === totalPages;
    nextBtn.style.cssText = 'padding: 6px 12px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 13px;' + (currentOrdersPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : '');
    nextBtn.onclick = () => {
        if (currentOrdersPage < totalPages) {
            currentOrdersPage++;
            renderFilteredOrders();
        }
    };
    buttonsContainer.appendChild(nextBtn);
}

async function handleOrderStatusDropdownChange(selectEl, orderId, currentStatus) {
    const newStatus = selectEl.value;
    if (newStatus === currentStatus) return;

    if (!confirm(`Are you sure you want to change order status from "${currentStatus}" to "${newStatus}"? An automated email notification will be sent to the customer.`)) {
        selectEl.value = currentStatus;
        return;
    }

    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message || `Order status updated to "${newStatus}"!`);
            fetchOrders();
        } else {
            showToast(data.message || "Failed to update order status.", 'error');
            selectEl.value = currentStatus;
        }
    } catch (err) {
        console.error("Error updating order status:", err);
        showToast("Server connection error.", 'error');
        selectEl.value = currentStatus;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`Are you sure you want to change order status to "${newStatus}"? An automated notification email will be sent to the customer.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message || `Order status updated to ${newStatus}!`);
            fetchOrders(); // Refresh order table
        } else {
            showToast(data.message || "Failed to update order status.", 'error');
        }
    } catch (err) {
        console.error("Error updating order status:", err);
        showToast("Failed to connect to server. Please try again.", 'error');
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message || 'Order deleted successfully!');
            fetchOrders(); // Refresh order table
        } else {
            showToast(data.message || 'Failed to delete order.', 'error');
        }
    } catch (err) {
        console.error("Error deleting order:", err);
        showToast("Failed to connect to server. Please try again.", 'error');
    }
}

// ==========================================
// 🌟 MULTIPLE BANNER CARDS LOGIC 🌟
// ==========================================

let localBannerCards = [];

async function loadAdminBanners() {
    const container = document.getElementById('admin-cards-container');
    if (!container) return; 

    try {
        const response = await fetch('/api/banner-cards', {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        container.innerHTML = ''; 
        localBannerCards = data.cards || [];

        // Update stats pills
        const slotsCountEl = document.getElementById('slider-cards-count');
        const imagesCountEl = document.getElementById('slider-images-count');
        
        let totalImages = 0;
        localBannerCards.forEach(c => {
            if (c.images && Array.isArray(c.images)) totalImages += c.images.length;
        });

        if (slotsCountEl) slotsCountEl.textContent = localBannerCards.length;
        if (imagesCountEl) imagesCountEl.textContent = totalImages;

        if (localBannerCards.length === 0) {
            container.innerHTML = `
                <div class="slider-empty-box">
                    <i class="fas fa-layer-group"></i>
                    <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 17px; font-weight: 700;">No Slider Carousel Slots Yet</h3>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Create your first slot to showcase promotional slides on your homepage.</p>
                    <button onclick="createNewCard()" class="btn" style="width: auto; padding: 10px 22px; font-size: 13px; font-weight: 700; margin: 0 auto; background: var(--primary);">
                        <i class="fas fa-plus"></i> Create Carousel Slot
                    </button>
                </div>
            `;
            return;
        }

        localBannerCards.forEach((card, index) => {
            const imageList = card.images || [];
            let imagesHtml = '';

            if (imageList.length > 0) {
                imageList.forEach((imgUrl, imgIndex) => {
                    imagesHtml += `
                        <div class="slide-item-card" data-aos="zoom-in">
                            <span class="slide-num-badge"><i class="fas fa-image"></i> Slide ${imgIndex + 1}</span>
                            <img src="${imgUrl}" alt="Slide ${imgIndex + 1}" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
                            <div class="slide-item-overlay">
                                <a href="${imgUrl}" target="_blank" class="slide-view-btn" title="View Full Resolution">
                                    <i class="fas fa-expand-alt"></i>
                                </a>
                                <button data-card-id="${card._id}" data-img-index="${imgIndex}" class="slide-delete-btn delete-img-btn" title="Delete Slide">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            } else {
                imagesHtml = `
                    <div style="grid-column: 1 / -1;" class="slider-empty-box">
                        <i class="fas fa-images"></i>
                        <h4 style="margin: 0 0 4px 0; color: #334155; font-size: 14px; font-weight: 700;">No slides in this slot</h4>
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">Use the uploader above to add promotional slide banners to this slot.</p>
                    </div>
                `;
            }

            container.innerHTML += `
                <div class="slider-mgmt-card" data-aos="fade-up">
                    <div class="slider-card-topbar">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="slider-slot-badge"><i class="fas fa-film"></i> Slot #${index + 1}</span>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${escapeHTML(card.heading || 'Untitled Carousel Slot')}</span>
                            <span style="font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px;">${imageList.length} ${imageList.length === 1 ? 'Slide' : 'Slides'}</span>
                        </div>
                        <button data-id="${card._id}" class="btn-action-icon btn-action-delete delete-card-btn" title="Delete Entire Slot" style="width: auto; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; gap: 6px;">
                            <i class="fas fa-trash-alt"></i> Delete Slot
                        </button>
                    </div>

                    <!-- Slot Heading Editor -->
                    <div class="slider-heading-form-box">
                        <label style="font-size: 13px; font-weight: 700; color: #334155; white-space: nowrap;"><i class="fas fa-heading" style="color: #0284c7; margin-right: 4px;"></i> Slot Title:</label>
                        <input type="text" id="heading-${card._id}" value="${escapeHTML(card.heading || '')}" placeholder="e.g. Featured Collection, Hot Summer Deals" class="slider-heading-input">
                        <button data-id="${card._id}" class="slider-save-heading-btn save-heading-btn">
                            <i class="fas fa-save"></i> Save Title
                        </button>
                    </div>

                    <!-- Slide Uploader Zone -->
                    <form data-id="${card._id}" class="upload-image-form" style="margin-bottom: 18px;">
                        <div style="display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap;">
                            <div class="modern-dropzone" style="flex: 1; min-width: 220px; padding: 12px 16px;">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span id="file-label-${card._id}">Select slide image (JPG, PNG, WebP)</span>
                                <input type="file" id="file-${card._id}" data-card-id="${card._id}" class="slider-file-input" accept="image/*" required>
                            </div>
                            <button type="submit" class="btn" style="width: auto; padding: 12px 24px; font-size: 13px; font-weight: 700; background: #0f172a; margin: 0; white-space: nowrap;">
                                <i class="fas fa-plus-circle"></i> Upload Slide to Slot
                            </button>
                        </div>
                        <div id="preview-box-${card._id}" class="dropzone-preview-box" style="display: none; margin-top: 10px;">
                            <img id="preview-img-${card._id}" src="" alt="Slide Preview" class="dropzone-preview-img">
                            <span style="font-size: 12px; font-weight: 600; color: #0f172a;">Ready to upload</span>
                        </div>
                    </form>

                    <!-- Slides Gallery Grid -->
                    <div style="margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fas fa-images"></i> Slides in this Carousel:</h4>
                        </div>
                        <div class="slider-gallery-grid">
                            ${imagesHtml}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error loading banners:", err);
        showToast('Error loading banner cards', 'error');
    }
}

async function updateCardHeading(cardId) {
    const headingInput = document.getElementById(`heading-${cardId}`);
    if (!headingInput) return;
    const headingValue = headingInput.value.trim();

    try {
        const response = await fetch(`/api/banner-cards/${cardId}/heading`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ heading: headingValue })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Slot title saved successfully!');
            loadAdminBanners();
        } else {
            showToast(data.message || 'Error saving slot title', 'error');
        }
    } catch (err) {
        console.error("Error saving heading:", err);
        showToast('Error saving slot title', 'error');
    }
}

async function createNewCard() {
    try {
        const response = await fetch('/api/banner-cards', { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders() 
            }
        });
        const data = await response.json();
        if (data.success) {
            showToast('New carousel slot added!');
            loadAdminBanners();
        } else {
            showToast('Failed to create slot', 'error');
        }
    } catch (err) { 
        console.error("Error creating card:", err);
        showToast('Error creating card', 'error'); 
    }
}

async function deleteCard(cardId) {
    if (!confirm("Are you sure you want to delete this entire carousel slot and all its slide images?")) return;
    try {
        const response = await fetch(`/api/banner-cards/${cardId}`, { 
            method: 'DELETE',
            headers: getAuthHeaders() 
        });
        const data = await response.json();
        if (data.success) {
            showToast('Carousel slot deleted');
            loadAdminBanners();
        } else {
            showToast('Failed to delete slot', 'error');
        }
    } catch (err) { 
        console.error("Error deleting card:", err);
        showToast('Error deleting card', 'error'); 
    }
}

async function uploadImageToCard(cardId) {
    const fileInput = document.getElementById(`file-${cardId}`);
    const file = fileInput ? fileInput.files[0] : null;
    if (!file) {
        showToast('Please choose an image file first', 'error');
        return;
    }

    try {
        showToast('Uploading slide image...');
        const base64 = await fileToBase64(file);
        const response = await fetch(`/api/banner-cards/${cardId}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ image: base64 })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Slide added to carousel!');
            loadAdminBanners(); 
        } else {
            showToast('Failed to upload slide: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) { 
        console.error("Error uploading image:", err);
        showToast('Error uploading image', 'error'); 
    }
}

async function deleteImageFromCard(cardId, imageIndex) {
    if (!confirm("Remove this slide image from the carousel?")) return;
    try {
        const response = await fetch(`/api/banner-cards/${cardId}/images/${imageIndex}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            showToast('Slide removed');
            loadAdminBanners();
        } else {
            showToast('Failed to remove slide', 'error');
        }
    } catch (err) { 
        console.error("Error deleting image:", err);
        showToast('Error deleting image', 'error'); 
    }
}



// ==========================================
// 🏷️ CATEGORY MANAGEMENT HELPERS
// ==========================================
let localCategories = [];

async function loadCategories() {
    try {
        let response = await fetch('/api/categories');
        if (!response.ok) {
            response = await fetchWithAuth('/api/admin/categories');
        }
        if (response && response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.categories)) {
                localCategories = data.categories;
            } else if (Array.isArray(data.categories)) {
                localCategories = data.categories;
            } else if (Array.isArray(data)) {
                localCategories = data;
            } else {
                localCategories = [];
            }
        }
        populateAddProductCategories();
    } catch (err) {
        console.error("Error loading categories:", err);
    }
}

function filterCategories(query) {
    const container = document.getElementById('categories-list-container');
    if (!container) return;

    if (!query) {
        renderCategoriesList(localCategories);
        return;
    }

    const q = query.toLowerCase();
    const filtered = localCategories.filter(cat => {
        const dName = (cat.displayName || cat.name || '').toLowerCase();
        const slug = (cat.slug || cat.name || '').toLowerCase();
        
        let subList = [];
        if (Array.isArray(cat.subcategories)) subList = cat.subcategories;
        else if (typeof cat.subcategories === 'string') subList = cat.subcategories.split(',');
        else if (Array.isArray(cat.subCategories)) subList = cat.subCategories;

        const subMatch = subList.some(s => {
            const str = typeof s === 'string' ? s : (s.name || s.title || '');
            return str.toLowerCase().includes(q);
        });

        return dName.includes(q) || slug.includes(q) || subMatch;
    });

    renderCategoriesList(filtered);
}

async function renderCategoriesTab() {
    const container = document.getElementById('categories-list-container');
    if (!container) return;

    await loadCategories();

    // Update stats pills
    const totalCatEl = document.getElementById('cat-total-count');
    const totalSubcatEl = document.getElementById('subcat-total-count');
    
    let totalSubcategories = 0;
    localCategories.forEach(c => {
        let subs = [];
        if (Array.isArray(c.subcategories)) subs = c.subcategories;
        else if (typeof c.subcategories === 'string' && c.subcategories.trim()) subs = c.subcategories.split(',');
        else if (Array.isArray(c.subCategories)) subs = c.subCategories;
        totalSubcategories += subs.length;
    });

    if (totalCatEl) totalCatEl.textContent = localCategories.length;
    if (totalSubcatEl) totalSubcatEl.textContent = totalSubcategories;

    renderCategoriesList(localCategories);
}

function renderCategoriesList(categories) {
    const container = document.getElementById('categories-list-container');
    if (!container) return;

    container.innerHTML = '';

    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1;" class="slider-empty-box">
                <i class="fas fa-folder-open"></i>
                <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 16px; font-weight: 700;">No Categories Found</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b;">Add a new category above to populate your storefront navigation and product catalog.</p>
            </div>
        `;
        return;
    }

    categories.forEach(cat => {
        const catId = cat._id || cat.id || cat.slug || cat.name;
        const displayName = cat.displayName || cat.name || cat.title || 'Category';
        const slug = cat.slug || cat.name || displayName.toLowerCase().replace(/\s+/g, '-');
        const iconSrc = cat.iconUrl || cat.icon || cat.imageUrl || './img/profile_image.jpg';
        const redirectText = cat.redirectUrl || `category.html?cat=${encodeURIComponent(slug)}`;

        let subList = [];
        if (Array.isArray(cat.subcategories)) {
            subList = cat.subcategories;
        } else if (typeof cat.subcategories === 'string' && cat.subcategories.trim()) {
            subList = cat.subcategories.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(cat.subCategories)) {
            subList = cat.subCategories;
        }

        let subListHtml = '';
        if (subList.length > 0) {
            subList.forEach(subItem => {
                const subName = typeof subItem === 'string' ? subItem : (subItem.name || subItem.title || String(subItem));
                if (!subName || !subName.trim()) return;
                subListHtml += `
                    <span class="subcat-chip">
                        <span>${escapeHTML(subName)}</span>
                        <span class="subcat-delete-btn" onclick="deleteSubcategory('${escapeHTML(catId)}', '${escapeHTML(subName)}')" title="Remove ${escapeHTML(subName)}">
                            <i class="fas fa-times"></i>
                        </span>
                    </span>
                `;
            });
        } else {
            subListHtml = `<p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px; font-style: italic;">No subcategories added yet.</p>`;
        }

        container.innerHTML += `
            <div class="cat-card-modern" data-aos="fade-up">
                <div>
                    <div class="cat-card-top">
                        <div class="cat-card-info-wrap">
                            <div class="cat-icon-container">
                                <img src="${iconSrc}" alt="${escapeHTML(displayName)}" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
                            </div>
                            <div class="cat-card-details">
                                <h3 class="cat-card-name">${escapeHTML(displayName)}</h3>
                                <div class="cat-meta-tags">
                                    <span class="cat-slug-pill">#${escapeHTML(slug)}</span>
                                    <span class="cat-route-pill" title="${escapeHTML(redirectText)}"><i class="fas fa-link" style="margin-right: 3px;"></i>${escapeHTML(redirectText)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="cat-card-actions">
                            <button class="btn-action-icon btn-action-edit" onclick="openEditCategoryModal('${catId}')" title="Edit Category">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action-icon btn-action-view" onclick="window.open('${escapeHTML(redirectText)}', '_blank')" title="View in Store">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                            <button class="btn-action-icon btn-action-delete" onclick="deleteCategory('${catId}')" title="Delete Category">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Subcategories Box -->
                    <div class="cat-subcategories-section">
                        <div class="cat-subcategories-header">
                            <span><i class="fas fa-tags" style="color: var(--primary); margin-right: 4px;"></i> Subcategories (${subList.length})</span>
                        </div>
                        <div class="subcat-chips-wrap">
                            ${subListHtml}
                        </div>
                        <div class="subcat-add-bar">
                            <input type="text" id="new-sub-${catId}" placeholder="Type subcategory name & press Enter..." class="subcat-add-input" onkeydown="if(event.key==='Enter'){event.preventDefault(); handleAddSubcategory('${catId}');}">
                            <button type="button" class="subcat-add-btn" onclick="handleAddSubcategory('${catId}')">
                                <i class="fas fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

async function populateAddProductCategories() {
    const catSelect = document.getElementById('prod-category');
    if (!catSelect) return;

    if (localCategories.length === 0) {
        await loadCategories();
    }

    catSelect.innerHTML = `<option value="" disabled selected>Select Category</option>`;
    localCategories.forEach(cat => {
        const slug = cat.slug || cat.name;
        const name = cat.displayName || cat.name;
        catSelect.innerHTML += `<option value="${escapeHTML(slug)}">${escapeHTML(name)}</option>`;
    });

    const subSelect = document.getElementById('prod-subcategory');
    if (subSelect) {
        subSelect.innerHTML = `<option value="" selected>None (Optional)</option>`;
    }
}

function populateSubcategories(categorySlug) {
    const subSelect = document.getElementById('prod-subcategory');
    if (!subSelect) return;

    const category = localCategories.find(c => (c.slug === categorySlug || c.name === categorySlug));
    let subs = [];
    if (category) {
        if (Array.isArray(category.subcategories)) subs = category.subcategories;
        else if (typeof category.subcategories === 'string') subs = category.subcategories.split(',');
        else if (Array.isArray(category.subCategories)) subs = category.subCategories;
    }

    if (!category || subs.length === 0) {
        subSelect.innerHTML = `<option value="" selected>None (Optional)</option>`;
        return;
    }

    subSelect.innerHTML = `<option value="" selected>None (Optional)</option>`;
    subs.forEach(sub => {
        const subName = typeof sub === 'string' ? sub : (sub.name || sub.title || String(sub));
        if (subName && subName.trim()) {
            subSelect.innerHTML += `<option value="${escapeHTML(subName.trim())}">${escapeHTML(subName.trim())}</option>`;
        }
    });
}

async function handleAddCategory(e) {
    e.preventDefault();
    const nameInput = document.getElementById('new-cat-name');
    const iconFileInput = document.getElementById('new-cat-icon-file');
    const iconUrlInput = document.getElementById('new-cat-icon-url');
    const redirectInput = document.getElementById('new-cat-redirect');

    const name = nameInput.value.trim();
    if (!name) return;

    let iconUrl = iconUrlInput ? iconUrlInput.value.trim() : '';

    if (iconFileInput && iconFileInput.files && iconFileInput.files[0]) {
        try {
            iconUrl = await fileToBase64(iconFileInput.files[0]);
        } catch (err) {
            console.error("Error reading category icon image file:", err);
        }
    }

    const redirectUrl = redirectInput ? redirectInput.value.trim() : '';

    const submitBtn = document.getElementById('add-cat-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    }

    try {
        const response = await fetchWithAuth('/api/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                displayName: name,
                iconUrl,
                redirectUrl
            })
        });

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Save & Publish Category';
        }

        if (!response) return;
        const data = await response.json();
        if (data.success) {
            showToast('Category added successfully!');
            nameInput.value = '';
            if (iconFileInput) iconFileInput.value = '';
            if (iconUrlInput) iconUrlInput.value = '';
            if (redirectInput) redirectInput.value = '';

            const previewWrapper = document.getElementById('cat-icon-preview-wrapper');
            const previewImg = document.getElementById('cat-icon-preview-img');
            if (previewWrapper) previewWrapper.style.display = 'none';
            if (previewImg) previewImg.src = '';

            renderCategoriesTab();
        } else {
            showToast('Failed to add category: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Save & Publish Category';
        }
        console.error("Error adding category:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

async function handleAddSubcategory(catId) {
    const input = document.getElementById(`new-sub-${catId}`);
    if (!input) return;
    const name = input.value.trim();
    if (!name) {
        showToast("Please enter a subcategory name.", 'error');
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/admin/categories/${encodeURIComponent(catId)}/subcategories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subcategory: name })
        });
        if (!response) return;
        const data = await response.json();
        if (data.success) {
            input.value = '';
            showToast('Subcategory added!');
            renderCategoriesTab();
        } else {
            showToast('Failed to add subcategory: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error adding subcategory:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

async function deleteSubcategory(catId, subName) {
    if (!confirm(`Remove subcategory "${subName}"?`)) return;
    try {
        const response = await fetchWithAuth(`/api/admin/categories/${encodeURIComponent(catId)}/subcategories/${encodeURIComponent(subName)}`, {
            method: 'DELETE'
        });
        if (!response) return;
        const data = await response.json();
        if (data.success) {
            showToast('Subcategory removed');
            renderCategoriesTab();
        } else {
            showToast('Failed to remove subcategory: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error deleting subcategory:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

async function deleteCategory(catId) {
    if (!confirm("Are you sure you want to delete this Category? All its subcategories will also be removed.")) return;
    try {
        const response = await fetchWithAuth(`/api/admin/categories/${encodeURIComponent(catId)}`, {
            method: 'DELETE'
        });
        if (!response) return;
        const data = await response.json();
        if (data.success) {
            showToast('Category deleted');
            renderCategoriesTab();
        } else {
            showToast('Failed to delete category: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error deleting category:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

function openEditCategoryModal(catId) {
    const cat = localCategories.find(c => String(c._id || c.id || c.slug) === String(catId));
    if (!cat) return;

    document.getElementById('edit-cat-id').value = cat._id || cat.id || cat.slug || '';
    document.getElementById('edit-cat-name').value = cat.displayName || cat.name || '';
    document.getElementById('edit-cat-icon-url').value = cat.iconUrl || cat.icon || '';
    document.getElementById('edit-cat-redirect').value = cat.redirectUrl || '';
    
    const preview = document.getElementById('edit-cat-icon-preview');
    if (preview) {
        preview.src = cat.iconUrl || cat.icon || './img/profile_image.jpg';
    }

    const modal = document.getElementById('edit-category-modal');
    if (modal) modal.style.display = 'block';
}

function closeEditCategoryModal() {
    const modal = document.getElementById('edit-category-modal');
    if (modal) modal.style.display = 'none';
}

async function handleEditCategorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-cat-id').value;
    const name = document.getElementById('edit-cat-name').value.trim();
    const iconFileInput = document.getElementById('edit-cat-icon-file');
    const iconUrlInput = document.getElementById('edit-cat-icon-url');
    const redirectInput = document.getElementById('edit-cat-redirect');

    if (!id || !name) return;

    let iconUrl = iconUrlInput ? iconUrlInput.value.trim() : '';

    if (iconFileInput && iconFileInput.files && iconFileInput.files[0]) {
        try {
            iconUrl = await fileToBase64(iconFileInput.files[0]);
        } catch (err) {
            console.error("Error reading edit category icon file:", err);
        }
    }

    const redirectUrl = redirectInput ? redirectInput.value.trim() : '';

    const saveBtn = document.getElementById('update-category-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';
    }

    try {
        const response = await fetchWithAuth(`/api/admin/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                displayName: name,
                iconUrl,
                redirectUrl
            })
        });

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }

        if (!response) return;
        const data = await response.json();

        if (data.success) {
            showToast('Category updated successfully!');
            closeEditCategoryModal();
            renderCategoriesTab();
        } else {
            showToast('Failed to update category: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
        console.error("Error updating category:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

// Attach actions to global context
window.deleteCategory = deleteCategory;
window.deleteSubcategory = deleteSubcategory;
window.handleAddSubcategory = handleAddSubcategory;
window.openEditCategoryModal = openEditCategoryModal;
window.closeEditCategoryModal = closeEditCategoryModal;
window.filterCategories = filterCategories;

// ==========================================
// 🎟️ PROMO CODE MANAGEMENT
// ==========================================
async function fetchPromoCodes() {
    try {
        const response = await fetch('/api/admin/promocodes', {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        const tbody = document.getElementById('promos-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!data.success || !data.promos || data.promos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No promo codes created yet.</td></tr>';
            return;
        }

        data.promos.forEach(promo => {
            const statusLabel = promo.isActive 
                ? '<span style="color:green; font-weight:bold;">Active</span>' 
                : '<span style="color:red; font-weight:bold;">Inactive</span>';
            const valueDisplay = promo.discountType === 'percentage' 
                ? `${promo.discountValue}%` 
                : `৳${promo.discountValue}`;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${escapeHTML(promo.code)}</strong></td>
                    <td style="text-transform: capitalize;">${escapeHTML(promo.discountType)}</td>
                    <td>${valueDisplay}</td>
                    <td>${statusLabel}</td>
                    <td>
                        <button onclick="deletePromoCode('${promo._id}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading promo codes:", err);
    }
}

async function handleAddPromoCode(e) {
    e.preventDefault();
    
    const code = document.getElementById('new-promo-code').value.trim();
    const discountType = document.getElementById('new-promo-type').value;
    const discountValue = Number(document.getElementById('new-promo-value').value);

    if (!code || isNaN(discountValue) || discountValue <= 0) {
        showToast("Please enter valid promo code information.", 'error');
        return;
    }

    try {
        const response = await fetch('/api/admin/promocodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ code, discountType, discountValue })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Promo Code created successfully!');
            document.getElementById('add-promo-form').reset();
            fetchPromoCodes();
        } else {
            showToast('Failed to create promo code: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error saving promo code:", err);
        showToast("An error occurred connecting to the server.", 'error');
    }
}

async function deletePromoCode(promoId) {
    if (!confirm("Are you sure you want to delete this Promo Code?")) return;
    try {
        const response = await fetch(`/api/admin/promocodes/${promoId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            fetchPromoCodes();
        } else {
            showToast('Failed to delete promo code: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error deleting promo code:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

// Expose actions to global context
window.deletePromoCode = deletePromoCode;

// ==========================================
// PUBLIC VOUCHERS MANAGEMENT
// ==========================================

async function fetchVouchers() {
    try {
        const response = await fetch('/api/admin/vouchers', {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        const tbody = document.getElementById('vouchers-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!data.success || !data.vouchers || data.vouchers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No vouchers created yet.</td></tr>';
            return;
        }

        data.vouchers.forEach(voucher => {
            const statusLabel = voucher.isActive 
                ? '<span style="color:green; font-weight:bold;">Active</span>' 
                : '<span style="color:red; font-weight:bold;">Inactive</span>';
            const valueDisplay = voucher.discountType === 'percentage' 
                ? `${voucher.discountValue}%` 
                : `৳${voucher.discountValue}`;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${escapeHTML(voucher.title)}</strong></td>
                    <td><span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${escapeHTML(voucher.code)}</span></td>
                    <td>${valueDisplay} (${escapeHTML(voucher.discountType)})</td>
                    <td>৳${voucher.minOrderAmount}</td>
                    <td>${statusLabel}</td>
                    <td>
                        <button onclick="deleteVoucher('${voucher._id}')" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading vouchers:", err);
    }
}

async function handleAddVoucher(e) {
    e.preventDefault();
    
    const title = document.getElementById('new-voucher-title').value.trim();
    const code = document.getElementById('new-voucher-code').value.trim();
    const minOrderAmount = Number(document.getElementById('new-voucher-min-amount').value);
    const discountType = document.getElementById('new-voucher-type').value;
    const discountValue = Number(document.getElementById('new-voucher-value').value);

    if (!code || !title || isNaN(discountValue) || discountValue <= 0) {
        showToast("Please enter valid voucher information.", 'error');
        return;
    }

    try {
        const response = await fetch('/api/admin/vouchers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ code, title, minOrderAmount, discountType, discountValue })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Voucher created successfully!');
            document.getElementById('add-voucher-form').reset();
            fetchVouchers();
        } else {
            showToast('Failed to create voucher: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error saving voucher:", err);
        showToast("An error occurred connecting to the server.", 'error');
    }
}

async function deleteVoucher(voucherId) {
    if (!confirm("Are you sure you want to delete this Voucher?")) return;
    try {
        const response = await fetch(`/api/admin/vouchers/${voucherId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            fetchVouchers();
        } else {
            showToast('Failed to delete voucher: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (err) {
        console.error("Error deleting voucher:", err);
        showToast('An error occurred connecting to the server.', 'error');
    }
}

window.deleteVoucher = deleteVoucher;



// ==========================================
// NAVBAR PROMO SLIDER MANAGEMENT
// ==========================================
// CUSTOMER RETURN REQUESTS MANAGEMENT
// ==========================================

async function fetchReturnRequests() {
    const tbody = document.getElementById('returns-table-body');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/returns', {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        tbody.innerHTML = '';

        if (!data.success || !data.returns || data.returns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No return requests submitted yet.</td></tr>';
            return;
        }

        data.returns.forEach(ret => {
            const date = new Date(ret.createdAt).toLocaleString();
            
            // Format status label with color badge
            let statusBadge = '';
            if (ret.status === 'pending') {
                statusBadge = '<span style="color:#ffc107; font-weight:bold; background:#fff9e6; padding:4px 8px; border-radius:4px;">Pending</span>';
            } else if (ret.status === 'approved') {
                statusBadge = '<span style="color:#28a745; font-weight:bold; background:#e6f9ed; padding:4px 8px; border-radius:4px;">Approved</span>';
            } else if (ret.status === 'rejected') {
                statusBadge = '<span style="color:#dc3545; font-weight:bold; background:#ffe8e8; padding:4px 8px; border-radius:4px;">Rejected</span>';
            }

            // Display buttons only if status is pending
            const actionButtons = ret.status === 'pending'
                ? `
                    <button class="btn" style="background:#28a745; padding:6px 12px; font-size:12px; margin:0 5px 0 0; width:auto; display:inline-block;" onclick="updateReturnStatus('${ret._id}', 'approved')"><i class="fas fa-check"></i> Approve</button>
                    <button class="btn" style="background:#dc3545; padding:6px 12px; font-size:12px; margin:0; width:auto; display:inline-block;" onclick="updateReturnStatus('${ret._id}', 'rejected')"><i class="fas fa-times"></i> Reject</button>
                  `
                : `<span style="color:#aaa; font-style:italic;">No Actions Available</span>`;

            tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td style="color:#007bff; font-weight:bold;">${escapeHTML(ret.orderNumber)}</td>
                    <td>${escapeHTML(ret.email)}</td>
                    <td><strong>${escapeHTML(ret.reason)}</strong></td>
                    <td style="font-size:13px; color:#555; max-width:250px; word-wrap:break-word;">${escapeHTML(ret.details || '-')}</td>
                    <td>${statusBadge}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching return requests:", err);
    }
}

async function updateReturnStatus(requestId, status) {
    const statusText = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${statusText} this return request?`)) return;

    try {
        const response = await fetch(`/api/admin/returns/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        if (data.success) {
            showToast(`Return request was ${status} successfully! Customer has been notified by email.`);
            fetchReturnRequests(); // Refresh the list
        } else {
            showToast("Failed to update status: " + (data.message || 'Unknown error', 'error'));
        }
    } catch (err) {
        console.error("Error updating return request status:", err);
        showToast("An error occurred connecting to the server.", 'error');
    }
}

// Expose actions to global context
window.fetchReturnRequests = fetchReturnRequests;
window.updateReturnStatus = updateReturnStatus;

// ==========================================
// CUSTOMER CONTACT MESSAGES MANAGEMENT
// ==========================================

async function fetchContactMessages() {
    const tbody = document.getElementById('messages-table-body');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/messages', {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        tbody.innerHTML = '';

        if (!data.success || !data.messages || data.messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No contact messages received yet.</td></tr>';
            return;
        }

        data.messages.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleString();
            
            // Format status badge
            let statusBadge = '';
            if (msg.status === 'unread') {
                statusBadge = '<span style="color:#0d6efd; font-weight:bold; background:#e3f2fd; padding:4px 8px; border-radius:4px;">Unread</span>';
            } else if (msg.status === 'read') {
                statusBadge = '<span style="color:#6c757d; font-weight:bold; background:#e2e3e5; padding:4px 8px; border-radius:4px;">Read</span>';
            }

            // Read/Delete actions
            const markReadButton = msg.status === 'unread'
                ? `<button class="btn" style="background:#0d6efd; padding:6px 12px; font-size:12px; margin:0 5px 0 0; width:auto; display:inline-block;" onclick="markMessageRead('${msg._id}')"><i class="fas fa-envelope-open"></i> Read</button>`
                : '';

            const deleteButton = `<button class="btn" style="background:#dc3545; padding:6px 12px; font-size:12px; margin:0; width:auto; display:inline-block;" onclick="deleteMessage('${msg._id}')"><i class="fas fa-trash-alt"></i> Delete</button>`;

            tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td><strong>${escapeHTML(msg.name)}</strong></td>
                    <td>${escapeHTML(msg.email)}</td>
                    <td style="font-size:13px; color:#555; max-width:350px; word-wrap:break-word;">${escapeHTML(msg.message)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        ${markReadButton}
                        ${deleteButton}
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching contact messages:", err);
    }
}

async function markMessageRead(messageId) {
    try {
        const response = await fetch(`/api/admin/messages/${messageId}/read`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            fetchContactMessages(); // Refresh the list
            fetchDashboardStats();  // Update dashboard unread counter
        } else {
            showToast("Failed to mark message as read: " + (data.message || 'Unknown error', 'error'));
        }
    } catch (err) {
        console.error("Error marking message as read:", err);
        showToast("An error occurred connecting to the server.", 'error');
    }
}

async function deleteMessage(messageId) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
        const response = await fetch(`/api/admin/messages/${messageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            showToast("Message deleted successfully!");
            fetchContactMessages(); // Refresh the list
            fetchDashboardStats();  // Update dashboard counter
        } else {
            showToast("Failed to delete message: " + (data.message || 'Unknown error', 'error'));
        }
    } catch (err) {
        console.error("Error deleting message:", err);
        showToast("An error occurred connecting to the server.", 'error');
    }
}

// Expose actions to global context
window.fetchContactMessages = fetchContactMessages;
window.markMessageRead = markMessageRead;
window.deleteMessage = deleteMessage;

// ==========================================
// EDIT PRODUCT MODAL HANDLERS
// ==========================================

async function openEditModal(id) {
    const prod = currentInventoryProducts.find(p => p._id === id);
    if (!prod) {
        showToast("Product details not found. Please refresh the inventory table.", 'error');
        return;
    }

    document.getElementById('edit-prod-id').value = prod._id;
    document.getElementById('edit-prod-name').value = prod.name;
    if (document.getElementById('edit-prod-buying-price')) document.getElementById('edit-prod-buying-price').value = prod.buyingPrice || 0;
    document.getElementById('edit-prod-price').value = prod.price;
    document.getElementById('edit-prod-stock').value = prod.stockQuantity;
    document.getElementById('edit-prod-size').value = prod.size || '';
    if (document.getElementById('edit-prod-size')._tagsInput) document.getElementById('edit-prod-size')._tagsInput.syncFromOriginal();
    document.getElementById('edit-prod-colour').value = prod.colour || '';
    if (document.getElementById('edit-prod-colour')._tagsInput) document.getElementById('edit-prod-colour')._tagsInput.syncFromOriginal();
    document.getElementById('edit-prod-brand').value = prod.brand || '';
    if (editProdDescEditor) { editProdDescEditor.root.innerHTML = prod.description || ''; }
    document.getElementById('edit-prod-preview').src = formatImageUrl(prod.imageUrl);
    document.getElementById('edit-prod-image').value = '';
    
    if (document.getElementById('edit-prod-discount-type')) {
        document.getElementById('edit-prod-discount-type').value = prod.discountType || 'none';
        document.getElementById('edit-prod-discount-value').value = prod.discountValue || 0;
    }

    // Populate Category & Subcategory dropdowns
    if (typeof localCategories === 'undefined' || localCategories.length === 0) {
        await loadCategories();
    }

    const catSelect = document.getElementById('edit-prod-category');
    if (catSelect) {
        catSelect.innerHTML = `<option value="" disabled>Select Category</option>`;
        localCategories.forEach(cat => {
            const selected = cat.slug === prod.category ? 'selected' : '';
            catSelect.innerHTML += `<option value="${cat.slug}" ${selected}>${cat.displayName}</option>`;
        });
    }

    populateEditSubcategories(prod.category, prod.subcategory);

    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.style.display = 'block';
}

function populateEditSubcategories(categorySlug, selectedSubcat = '') {
    const subSelect = document.getElementById('edit-prod-subcategory');
    if (!subSelect) return;

    const category = localCategories.find(c => c.slug === categorySlug);
    if (!category || !category.subcategories || category.subcategories.length === 0) {
        subSelect.innerHTML = `<option value="" selected>None (Optional)</option>`;
        return;
    }

    subSelect.innerHTML = `<option value="" ${!selectedSubcat ? 'selected' : ''}>None (Optional)</option>`;
    category.subcategories.forEach(sub => {
        const selected = sub === selectedSubcat ? 'selected' : '';
        subSelect.innerHTML += `<option value="${sub}" ${selected}>${sub}</option>`;
    });
}

function closeEditModal() {
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.style.display = 'none';
}

async function handleEditProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-prod-id').value;
    const saveBtn = document.getElementById('update-product-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving Changes...';

    const imageFile = document.getElementById('edit-prod-image').files[0];
    let imageBase64 = "";

    if (imageFile) {
        try {
            imageBase64 = await fileToBase64(imageFile);
        } catch (err) {
            console.error("Error reading image:", err);
            showToast("Failed to read new image file.", 'error');
            saveBtn.disabled = false;
            saveBtn.innerText = 'Save Changes';
            return;
        }
    }

    const payload = {
        name: document.getElementById('edit-prod-name').value,
        buyingPrice: document.getElementById('edit-prod-buying-price') ? document.getElementById('edit-prod-buying-price').value : 0,
        price: document.getElementById('edit-prod-price').value,
        category: document.getElementById('edit-prod-category').value,
        subcategory: document.getElementById('edit-prod-subcategory').value,
        size: document.getElementById('edit-prod-size').value,
        colour: document.getElementById('edit-prod-colour').value,
        brand: document.getElementById('edit-prod-brand').value,
        description: editProdDescEditor ? editProdDescEditor.root.innerHTML : '',
        stock: document.getElementById('edit-prod-stock').value,
        discountType: document.getElementById('edit-prod-discount-type') ? document.getElementById('edit-prod-discount-type').value : 'none',
        discountValue: document.getElementById('edit-prod-discount-value') ? document.getElementById('edit-prod-discount-value').value : 0,
        image: imageBase64
    };

    try {
        const response = await fetchWithAuth(`/api/admin/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response) return;
        const data = await response.json();

        if (data.success) {
            showToast('Product updated successfully!');
            closeEditModal();
            fetchManageProducts();
        } else {
            showToast('Failed to update product: ' + (data.message || 'Unknown error', 'error'));
        }
    } catch (err) {
        console.error("Error updating product:", err);
        showToast("An error occurred connecting to the server.", 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Changes';
    }
}

// Expose modal handlers to global context
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;

// ==========================================
// CUSTOMER REVIEWS MANAGEMENT
// ==========================================
async function fetchAdminReviews() {
    const tbody = document.getElementById('reviews-table-body');
    if (!tbody) return;

    try {
        const response = await fetchWithAuth('/api/admin/reviews');
        if (!response) return;

        const data = await response.json();
        tbody.innerHTML = '';

        if (!data.reviews || data.reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No customer reviews submitted yet.</td></tr>';
            return;
        }

        data.reviews.forEach(rev => {
            const date = new Date(rev.createdAt).toLocaleString();
            const stars = '⭐'.repeat(rev.rating);
            const isPub = rev.isPublished;
            
            const statusBadge = isPub 
                ? '<span style="background:#28a745; color:white; padding:4px 8px; border-radius:4px; font-weight:600; font-size:12px;">Published</span>' 
                : '<span style="background:#ffc107; color:#212529; padding:4px 8px; border-radius:4px; font-weight:600; font-size:12px;">Pending Approval</span>';

            const publishBtn = isPub
                ? `<button onclick="togglePublishReview('${rev._id}', false)" class="btn" style="background:#6c757d; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px; margin-right:4px;" title="Unpublish from Homepage"><i class="fas fa-eye-slash"></i> Unpublish</button>`
                : `<button onclick="togglePublishReview('${rev._id}', true)" class="btn" style="background:#28a745; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px; margin-right:4px;" title="Post to Homepage Slider"><i class="fas fa-paper-plane"></i> Post to Slider</button>`;

            tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td><strong>${escapeHTML(rev.productName || 'General')}</strong></td>
                    <td>${escapeHTML(rev.reviewerName)}</td>
                    <td style="font-size:14px;">${stars} (${rev.rating}/5)</td>
                    <td style="max-width:250px; word-break:break-word;">${escapeHTML(rev.comment)}</td>
                    <td>${statusBadge}</td>
                    <td style="white-space:nowrap;">
                        ${publishBtn}
                        <button onclick="deleteAdminReview('${rev._id}')" class="btn" style="background:#dc3545; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; font-size:12px;" title="Delete Review"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching admin reviews:", err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load reviews.</td></tr>';
    }
}

async function togglePublishReview(reviewId, isPublished) {
    const actionText = isPublished ? "post this review to the homepage slider" : "unpublish this review";
    if (!confirm(`Are you sure you want to ${actionText}?`)) return;

    try {
        const response = await fetchWithAuth(`/api/admin/reviews/${reviewId}/publish`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast(data.message);
            fetchAdminReviews();
        } else {
            showToast(data.message || "Failed to update review.", 'error');
        }
    } catch (err) {
        console.error("Error toggling review status:", err);
        showToast("Failed to connect to server.", 'error');
    }
}

async function deleteAdminReview(reviewId) {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
        const response = await fetchWithAuth(`/api/admin/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast(data.message);
            fetchAdminReviews();
        } else {
            showToast(data.message || "Failed to delete review.", 'error');
        }
    } catch (err) {
        console.error("Error deleting review:", err);
        showToast("Failed to connect to server.", 'error');
    }
}

window.togglePublishReview = togglePublishReview;
window.deleteAdminReview = deleteAdminReview;

// ==========================================
// ⚙️ ADMIN SETTINGS & USER ACCESS MANAGEMENT
// ==========================================

async function initSettingsTab() {
    try {
        const response = await fetchWithAuth('/api/user-data');
        if (response && response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                const currentEmailInput = document.getElementById('setting-current-email');
                if (currentEmailInput) currentEmailInput.value = data.user.email || '';
            }
        }
    } catch (err) {
        console.error("Error loading user profile data:", err);
    }
    fetchAdminUsers();
    fetchSettings();
}

async function handleChangeEmail(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('setting-email-confirm-pass').value;
    const newEmail = document.getElementById('setting-new-email').value.trim();

    if (!currentPassword || !newEmail) {
        showToast("Please fill in both your current password and new email.", 'error');
        return;
    }

    try {
        const response = await fetchWithAuth('/api/admin/settings/email', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newEmail })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast(data.message || "Email updated successfully!");
            document.getElementById('change-email-form').reset();
            const currentEmailInput = document.getElementById('setting-current-email');
            if (currentEmailInput) currentEmailInput.value = data.email;
        } else {
            showToast(data.message || "Failed to update email.", 'error');
        }
    } catch (err) {
        console.error("Change Email Error:", err);
        showToast("Failed to connect to server.", 'error');
    }
}

async function handleChangeBrandLogo(e) {
    e.preventDefault();
    const logoInput = document.getElementById('brand-logo-input');
    if (!logoInput.files || !logoInput.files[0]) {
        showToast("Please select an image file first.", "error");
        return;
    }

    const file = logoInput.files[0];
    try {
        const base64Image = await fileToBase64(file);
        const response = await fetchWithAuth('/api/admin/settings/logo', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl: base64Image })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast("Brand logo & favicon updated successfully! Changes apply globally.");
            const logoPreview = document.getElementById('current-brand-logo-preview');
            if (logoPreview) logoPreview.src = base64Image;
            updateFavicon(base64Image);
            try {
                localStorage.setItem('site_brand_logo', base64Image);
            } catch(e) {}
            document.getElementById('brand-logo-form').reset();
        } else {
            showToast(data.message || "Failed to update logo.", "error");
        }
    } catch (err) {
        console.error("Change Brand Logo Error:", err);
        showToast("Error processing the image.", "error");
    }
}

async function handleChangeBrandName(e) {
    e.preventDefault();
    const nameInput = document.getElementById('brand-name-input');
    const newName = nameInput ? nameInput.value.trim() : '';
    if (!newName) {
        showToast("Please enter a brand name.", "error");
        return;
    }

    try {
        const response = await fetchWithAuth('/api/admin/settings/brandName', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandName: newName })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast("Brand name updated successfully! All pages updated.");
            try {
                localStorage.setItem('site_brand_name', newName);
            } catch(e) {}
        } else {
            showToast(data.message || "Failed to update brand name.", "error");
        }
    } catch (err) {
        console.error("Change Brand Name Error:", err);
        showToast("Error updating brand name.", "error");
    }
}

async function handleChangeMarqueeSettings(e) {
    e.preventDefault();
    const textInput = document.getElementById('marquee-text-input');
    const enabledInput = document.getElementById('marquee-enabled-input');
    const speedSelect = document.getElementById('marquee-speed-select');

    const marqueeText = textInput ? textInput.value.trim() : '';
    const marqueeEnabled = enabledInput ? enabledInput.checked : true;
    const marqueeSpeed = speedSelect ? speedSelect.value : '25s';

    if (!marqueeText) {
        showToast("Please enter marquee announcement text.", "error");
        return;
    }

    try {
        const response = await fetchWithAuth('/api/admin/settings/marquee', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ marqueeText, marqueeEnabled, marqueeSpeed })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast("Marquee announcement banner settings updated successfully!");
        } else {
            showToast(data.message || "Failed to update marquee settings.", "error");
        }
    } catch (err) {
        console.error("Change Marquee Error:", err);
        showToast("Error updating marquee settings.", "error");
    }
}

async function handleChangePopupSettings(e) {
    e.preventDefault();
    const enabledInput = document.getElementById('popup-enabled-input');
    const fileInput = document.getElementById('popup-image-input');
    const urlInput = document.getElementById('popup-image-url-input');
    const linkInput = document.getElementById('popup-link-input');
    const previewImg = document.getElementById('popup-preview-img');

    const popupEnabled = enabledInput ? enabledInput.checked : true;
    const popupLink = linkInput ? linkInput.value.trim() : '';
    let popupImage = '';

    if (fileInput && fileInput.files && fileInput.files[0]) {
        popupImage = await fileToBase64(fileInput.files[0]);
    } else if (urlInput && urlInput.value.trim()) {
        popupImage = urlInput.value.trim();
    } else if (previewImg && previewImg.src && !previewImg.src.includes('window.location') && previewImg.src.length > 50) {
        popupImage = previewImg.src;
    }

    if (popupEnabled && !popupImage) {
        showToast("Please upload an image or provide an image URL for the popup.", "error");
        return;
    }

    try {
        const response = await fetchWithAuth('/api/admin/settings/popup', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ popupImage, popupEnabled, popupLink })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast("Homepage welcome popup settings saved successfully!");
            fetchSettings();
        } else {
            showToast(data.message || "Failed to update popup settings.", "error");
        }
    } catch (err) {
        console.error("Popup Settings Error:", err);
        showToast("Error updating popup settings.", "error");
    }
}

async function handleRemovePopupImage() {
    if (!confirm("Are you sure you want to remove the homepage popup image?")) return;

    try {
        const response = await fetchWithAuth('/api/admin/settings/popup', {
            method: 'DELETE'
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast("Homepage popup removed successfully!");
            const previewImg = document.getElementById('popup-preview-img');
            const previewContainer = document.getElementById('popup-preview-container');
            const noImgText = document.getElementById('popup-no-img-text');
            const fileInput = document.getElementById('popup-image-input');
            const urlInput = document.getElementById('popup-image-url-input');
            const linkInput = document.getElementById('popup-link-input');

            if (previewImg) previewImg.src = '';
            if (previewContainer) previewContainer.style.display = 'none';
            if (noImgText) noImgText.style.display = 'block';
            if (fileInput) fileInput.value = '';
            if (urlInput) urlInput.value = '';
            if (linkInput) linkInput.value = '';
        } else {
            showToast(data.message || "Failed to remove popup.", "error");
        }
    } catch (err) {
        console.error("Remove Popup Error:", err);
        showToast("Error removing popup.", "error");
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('setting-current-pass').value;
    const newPassword = document.getElementById('setting-new-pass').value;
    const confirmPassword = document.getElementById('setting-confirm-new-pass').value;

    if (newPassword !== confirmPassword) {
        showToast("New password and confirm password do not match!");
        return;
    }

    if (newPassword.length < 8) {
        showToast("New password must be at least 8 characters long.");
        return;
    }

    try {
        const response = await fetchWithAuth('/api/admin/settings/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast(data.message || "Password updated successfully!");
            document.getElementById('change-password-form').reset();
        } else {
            showToast(data.message || "Failed to update password.", 'error');
        }
    } catch (err) {
        console.error("Change Password Error:", err);
        showToast("Failed to connect to server.", 'error');
    }
}

async function fetchAdminUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    try {
        const response = await fetchWithAuth('/api/admin/users');
        if (!response) return;

        const data = await response.json();
        tbody.innerHTML = '';

        if (!data.success || !data.users || data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No user accounts found.</td></tr>';
            return;
        }

        data.users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${escapeHTML(user.username)}</strong></td>
                    <td>${escapeHTML(user.email)}</td>
                    <td>${escapeHTML(user.loginCount || 0)} times</td>
                    <td><span style="background:#e6f9ed; color:#28a745; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:700;">Administrator</span></td>
                    <td>
                        <button onclick="deleteUserAccess('${escapeHTML(user._id)}')" class="btn" style="background:#dc3545; color:white; width:auto; padding:5px 10px; font-size:12px;" title="Revoke User Access"><i class="fas fa-trash-alt"></i> Revoke Access</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching admin users:", err);
    }
}

async function fetchCustomerUsers() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    try {
        const response = await fetchWithAuth('/api/admin/customers');
        if (!response) return;

        const data = await response.json();
        tbody.innerHTML = '';

        if (!data.success || !data.customers || data.customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No customer accounts found.</td></tr>';
            return;
        }

        data.customers.forEach(customer => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${escapeHTML(customer.username)}</strong></td>
                    <td>${escapeHTML(customer.email || 'N/A')}</td>
                    <td>${escapeHTML(customer.phone || 'N/A')}</td>
                    <td><span style="font-size: 13px;">${escapeHTML(customer.address || 'N/A')}</span></td>
                    <td><span style="background:#e3f2fd; color:#0d6efd; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:700;">Customer</span></td>
                    <td>${escapeHTML(customer.loginCount || 0)} times</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching customer users:", err);
    }
}

async function handleCreateUser(e) {
    e.preventDefault();
    const username = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const password = document.getElementById('new-user-pass').value;

    if (!username || !email || !password) {
        showToast("Please enter a username, email, and initial password.", 'error');
        return;
    }

    try {
        const response = await fetchWithAuth('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast(data.message || "User access granted successfully!");
            document.getElementById('create-user-form').reset();
            fetchAdminUsers();
        } else {
            showToast(data.message || "Failed to create user account.", 'error');
        }
    } catch (err) {
        console.error("Create User Error:", err);
        showToast("Failed to connect to server.", 'error');
    }
}

async function deleteUserAccess(userId) {
    if (!confirm("Are you sure you want to revoke access for this user account?")) return;

    try {
        const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        if (!response) return;

        const data = await response.json();
        if (data.success) {
            showToast(data.message || "User access revoked.");
            fetchAdminUsers();
        } else {
            showToast(data.message || "Failed to revoke access.", 'error');
        }
    } catch (err) {
        console.error("Delete User Error:", err);
        showToast("Failed to connect to server.", 'error');
    }
}

window.deleteUserAccess = deleteUserAccess;

// ==========================================
// ⚡ FLASH SALE COUNTDOWN BANNER — ADMIN TAB
// ==========================================

let flashSalePreviewInterval = null;

async function initFlashSaleTab() {
    // Load existing config from server
    try {
        const res = await fetch('/api/flash-sale');
        const data = await res.json();
        if (data.success && data.flashSale) {
            const fs = data.flashSale;
            document.getElementById('flash-title').value = fs.title || '';
            document.getElementById('flash-subtitle').value = fs.subtitle || '';
            document.getElementById('flash-button-text').value = fs.buttonText || '';
            document.getElementById('flash-button-link').value = fs.buttonLink || '';
            document.getElementById('flash-is-active').checked = !!fs.isActive;
            updateFlashStatusLabel(!!fs.isActive);

            // Convert stored UTC date to local datetime-local format
            if (fs.endTime) {
                const d = new Date(fs.endTime);
                const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 16);
                document.getElementById('flash-end-time').value = local;
            }
            updateFlashPreview();
        }
    } catch (err) {
        console.error('Flash sale load error:', err);
    }

    // Live-update preview whenever inputs change
    ['flash-title','flash-subtitle','flash-button-text','flash-button-link','flash-end-time']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateFlashPreview);
        });

    const checkbox = document.getElementById('flash-is-active');
    if (checkbox) {
        checkbox.addEventListener('change', () => updateFlashStatusLabel(checkbox.checked));
    }

    // Start preview timer tick
    if (flashSalePreviewInterval) clearInterval(flashSalePreviewInterval);
    flashSalePreviewInterval = setInterval(updatePreviewTimerTick, 1000);

    // Form submit
    const form = document.getElementById('flash-sale-form');
    if (form && !form.dataset.listenerAttached) {
        form.dataset.listenerAttached = 'true';
        form.addEventListener('submit', handleFlashSaleSubmit);
    }
}

function updateFlashStatusLabel(active) {
    const label = document.getElementById('flash-status-label');
    if (!label) return;
    if (active) {
        label.textContent = 'Banner Active (Visible to Customers)';
        label.style.color = '#28a745';
    } else {
        label.textContent = 'Banner Hidden (Inactive)';
        label.style.color = '#999';
    }
}

function updateFlashPreview() {
    const title    = document.getElementById('flash-title')?.value || '⚡ Flash Sale Ends In:';
    const subtitle = document.getElementById('flash-subtitle')?.value || '';
    const btnText  = document.getElementById('flash-button-text')?.value || 'Shop Now';
    const btnLink  = document.getElementById('flash-button-link')?.value || '#';

    const previewTitle = document.getElementById('preview-title');
    const previewSubtitle = document.getElementById('preview-subtitle');
    const previewBtn = document.getElementById('preview-btn');

    if (previewTitle) previewTitle.textContent = title;
    if (previewSubtitle) {
        previewSubtitle.textContent = subtitle;
        previewSubtitle.style.display = subtitle ? 'inline' : 'none';
    }
    if (previewBtn) {
        previewBtn.textContent = '';
        previewBtn.innerHTML = btnText + ' <i class="fas fa-arrow-right" style="margin-left:5px;"></i>';
        previewBtn.href = btnLink;
    }
    updatePreviewTimerTick();
}

function updatePreviewTimerTick() {
    const endInput = document.getElementById('flash-end-time');
    const timerEl = document.getElementById('preview-timer');
    if (!endInput || !timerEl) return;

    const endTime = endInput.value ? new Date(endInput.value).getTime() : 0;
    const now = Date.now();
    const diff = endTime - now;

    if (!endInput.value || diff <= 0) {
        timerEl.innerHTML = '<span style="color:#ff3b70;">00</span>h : <span style="color:#ff3b70;">00</span>m : <span style="color:#ff3b70;">00</span>s';
        return;
    }

    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    timerEl.innerHTML = `<span style="color:#ff3b70;">${h}</span>h : <span style="color:#ff3b70;">${m}</span>m : <span style="color:#ff3b70;">${s}</span>s`;
}

async function handleFlashSaleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const endTimeLocal = document.getElementById('flash-end-time').value;
    if (!endTimeLocal) {
        showToast('Please set a Countdown End Date & Time.', 'error');
        return;
    }

    const payload = {
        title:       document.getElementById('flash-title').value.trim() || '⚡ Flash Sale Ends In:',
        subtitle:    document.getElementById('flash-subtitle').value.trim(),
        buttonText:  document.getElementById('flash-button-text').value.trim() || 'Shop Now',
        buttonLink:  document.getElementById('flash-button-link').value.trim() || 'index.html#products',
        endTime:     new Date(endTimeLocal).toISOString(),
        isActive:    document.getElementById('flash-is-active').checked,
        bgColor:     '#111111',
        textColor:   '#ffffff',
        accentColor: '#e60050'
    };

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    try {
        const res = await fetch('/api/admin/flash-sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('✅ Flash sale banner saved and published!');
        } else {
            showToast('❌ ' + (data.message || 'Failed to save flash sale banner.', 'error'));
        }
    } catch (err) {
        console.error('Flash sale save error:', err);
        showToast('Server connection error.', 'error');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-save"></i> Save & Publish Flash Sale Banner'; }
    }
}

class TagsInput {
    constructor(element) {
        this.originalInput = element;
        this.originalInput.style.display = 'none';
        
        this.container = document.createElement('div');
        this.container.className = 'tags-input-container';
        
        this.tags = [];
        const initialValue = this.originalInput.value.trim();
        if (initialValue) {
            this.tags = initialValue.split(',').map(t => t.trim()).filter(t => t);
        }

        this.tagElements = document.createElement('div');
        this.tagElements.className = 'tags-wrapper';
        this.container.appendChild(this.tagElements);

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = this.originalInput.getAttribute('placeholder') || 'Type and press Enter';
        this.input.className = 'tag-input-field';
        this.container.appendChild(this.input);
        
        this.originalInput.parentNode.insertBefore(this.container, this.originalInput);

        this.renderTags();
        this.bindEvents();
    }

    bindEvents() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = this.input.value.trim().replace(/,/g, '');
                if (val && !this.tags.includes(val)) {
                    this.tags.push(val);
                    this.updateOriginal();
                    this.renderTags();
                }
                this.input.value = '';
            } else if (e.key === 'Backspace' && this.input.value === '' && this.tags.length > 0) {
                this.tags.pop();
                this.updateOriginal();
                this.renderTags();
            }
        });
        
        this.container.addEventListener('click', () => {
            this.input.focus();
        });
    }

    renderTags() {
        this.tagElements.innerHTML = '';
        this.tags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-item';
            tagEl.innerHTML = `${escapeHTML(tag)} <i class="fas fa-times" data-index="${index}"></i>`;
            this.tagElements.appendChild(tagEl);
        });

        this.tagElements.querySelectorAll('.fa-times').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                this.tags.splice(idx, 1);
                this.updateOriginal();
                this.renderTags();
            });
        });
    }

    updateOriginal() {
        this.originalInput.value = this.tags.join(', ');
        this.originalInput.dispatchEvent(new Event('change'));
    }
    
    syncFromOriginal() {
        const val = this.originalInput.value.trim();
        this.tags = val ? val.split(',').map(t => t.trim()).filter(t => t) : [];
        this.renderTags();
    }
}

// ==========================================
// BLOG MANAGEMENT LOGIC
// ==========================================

let quillEditor = null;

// Initialize Quill Editor if not already initialized
function initBlogEditor() {
    if (!quillEditor && document.getElementById('blog-editor-container')) {
        quillEditor = new Quill('#blog-editor-container', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'header': [1, 2, 3, false] }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }
        });
    }
}

// Fetch and display admin blogs
async function fetchAdminBlogs() {
    initBlogEditor();
    
    const tbody = document.getElementById('blogs-table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';
    
    try {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        
        if (res.ok && data.success) {
            renderAdminBlogs(data.blogs);
        } else {
            if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red;">Failed to load blogs.</td></tr>';
        }
    } catch (err) {
        console.error("fetchAdminBlogs error:", err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red;">Connection error.</td></tr>';
    }
}

function renderAdminBlogs(blogs) {
    const tbody = document.getElementById('blogs-table-body');
    if (!tbody) return;
    
    if (!blogs || blogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No blogs found. Create one above!</td></tr>';
        return;
    }
    
    tbody.innerHTML = blogs.map(blog => `
        <tr>
            <td>
                <img src="${formatImageUrl(blog.imageUrl)}" alt="${escapeHTML(blog.title)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            </td>
            <td><strong>${escapeHTML(blog.title)}</strong></td>
            <td>${new Date(blog.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-icon-danger" onclick="deleteAdminBlog('${blog._id}')" title="Delete Blog">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Handle Add Blog Form Submission
document.addEventListener('DOMContentLoaded', () => {
    const addBlogForm = document.getElementById('add-blog-form');
    if (addBlogForm) {
        addBlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('adminToken');
            
            const title = document.getElementById('blog-title').value.trim();
            const imageFile = document.getElementById('blog-image').files[0];
            const descriptionHTML = quillEditor ? quillEditor.root.innerHTML : '';
            
            if (!title) return showToast('Please enter a blog title', 'error');
            if (!descriptionHTML || descriptionHTML === '<p><br></p>') return showToast('Please enter a blog description', 'error');
            if (!imageFile) return showToast('Please attach a blog image', 'error');
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...'; }
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', descriptionHTML);
            formData.append('image', imageFile);
            
            try {
                const res = await fetch('/api/admin/blogs', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: formData
                });
                
                const data = await res.json();
                if (res.ok && data.success) {
                    showToast('✅ Blog created successfully!');
                    addBlogForm.reset();
                    if (quillEditor) quillEditor.root.innerHTML = '';
                    fetchAdminBlogs(); // Refresh list
                } else {
                    showToast('❌ ' + (data.message || 'Failed to create blog'), 'error');
                }
            } catch (err) {
                console.error("Create blog error:", err);
                showToast('❌ Connection error. Please try again.', 'error');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Upload Blog'; }
            }
        });
    }
});

// Delete a blog
async function deleteAdminBlog(id) {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    
    const token = localStorage.getItem('adminToken');
    try {
        const res = await fetch(`/api/admin/blogs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
            showToast('✅ Blog deleted successfully!');
            fetchAdminBlogs();
        } else {
            showToast('❌ ' + (data.message || 'Failed to delete blog'), 'error');
        }
    } catch (err) {
        console.error("Delete blog error:", err);
        showToast('❌ Connection error.', 'error');
    }
}

// ==========================================
// ADVANCED DASHBOARD VISUALS
// ==========================================
async function fetchDashboardVisuals() {
    try {
        const response = await fetch('/api/admin/orders', {
            headers: getAuthHeaders()
        });
        if (!response || !response.ok) return;
        const data = await response.json();
        const orders = data.orders || [];
        renderAdvancedVisuals(orders);
    } catch (err) {
        console.error('fetchDashboardVisuals error:', err);
    }
}

function renderAdvancedVisuals(orders) {
    calculateRevenueByCity(orders);
    calculateOrdersByHour(orders);
    calculatePaymentMethods(orders);
    renderLatestPendingOrders(orders);
    renderLatestActiveOrders(orders);
}

function calculateRevenueByCity(orders) {
    const container = document.getElementById('city-revenue-container');
    if(!container) return;
    
    let cityRev = {};
    orders.forEach(o => {
        let city = 'Unknown';
        let addr = (o.address || '').trim().toLowerCase();
        
        if (addr.includes('inside dhaka') || addr.includes('dhaka') && !addr.includes('outside')) {
            city = 'Inside Dhaka';
        } else if (addr.includes('outside dhaka')) {
            city = 'Outside Dhaka';
        } else if (addr) {
            // Try to extract district/city from address
            city = o.address.trim().split(',').pop().trim() || 'Other';
        }
        
        let total = parseFloat(o.totalAmount) || 0;
        cityRev[city] = (cityRev[city] || 0) + total;
    });
    
    // Sort cities by revenue
    const sortedCities = Object.entries(cityRev).sort((a,b) => b[1] - a[1]).slice(0, 5);
    
    if(sortedCities.length === 0) {
        container.innerHTML = '<div style="color:#888; font-size:12px;">No city data found</div>';
        return;
    }
    
    const maxRev = sortedCities[0][1];
    
    let html = '';
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899'];
    
    sortedCities.forEach((item, index) => {
        let city = item[0];
        let rev = item[1];
        let pct = maxRev > 0 ? (rev / maxRev) * 100 : 0;
        let color = colors[index % colors.length];
        
        html += `
        <div class="city-progress-wrap">
            <div class="city-progress-header">
                <span>${escapeHTML(city)}</span>
                <span>৳ ${rev.toLocaleString()}</span>
            </div>
            <div class="city-progress-bar">
                <div class="city-progress-fill" style="width: ${pct}%; background: ${color};"></div>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

function calculateOrdersByHour(orders) {
    const canvas = document.getElementById('ordersHourChart');
    if(!canvas || typeof Chart === 'undefined') return;
    
    let hourCounts = Array(24).fill(0);
    orders.forEach(o => {
        let dateField = o.orderDate || o.createdAt;
        if(dateField) {
            let d = new Date(dateField);
            if(!isNaN(d.getTime())) {
                hourCounts[d.getHours()]++;
            }
        }
    });
    
    const labels = ['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM',
                    '12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
    
    if(chartInstances['ordersHourChart']) {
        destroyChart('ordersHourChart');
    }
    
    chartInstances['ordersHourChart'] = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: hourCounts,
                backgroundColor: '#10b981',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { borderDash: [2, 2], color: '#f0f0f0' }, beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
}

function calculatePaymentMethods(orders) {
    const canvas = document.getElementById('paymentMethodsChart');
    if(!canvas || typeof Chart === 'undefined') return;
    
    let methods = {};
    orders.forEach(o => {
        let pm = o.paymentMethod || 'Unknown';
        if(pm === 'Cash on Delivery') pm = 'COD';
        methods[pm] = (methods[pm] || 0) + (parseFloat(o.totalAmount) || 0);
    });
    
    const labels = Object.keys(methods);
    const data = Object.values(methods);
    
    if(chartInstances['paymentMethodsChart']) {
        destroyChart('paymentMethodsChart');
    }
    
    const colorMap = {
        'bKash': '#e2136e',
        'COD': '#10b981',
        'Nagad': '#f97316',
        'Card': '#4f46e5',
        'Unknown': '#94a3b8'
    };
    const bgColors = labels.map(l => colorMap[l] || '#4f46e5');
    
    chartInstances['paymentMethodsChart'] = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff',
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ' ৳ ' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function renderLatestPendingOrders(orders) {
    const tbody = document.getElementById('visual-pending-orders-tbody');
    const badge = document.getElementById('pending-orders-badge');
    if(!tbody) return;
    
    const pendingOrders = orders.filter(o => o.status === 'Pending').sort((a,b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
    if(badge) badge.innerText = pendingOrders.length;
    
    const latest = pendingOrders.slice(0, 5);
    
    if(latest.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No pending orders</td></tr>';
        return;
    }
    
    let html = '';
    latest.forEach(o => {
        const dateStr = new Date(o.orderDate || o.createdAt).toLocaleDateString();
        const phone = o.phone || 'N/A';
        html += `
        <tr>
            <td><span class="phone">${escapeHTML(phone)}</span></td>
            <td><span class="invoice" onclick="goToOrdersTab('Pending')">#${o.orderNumber || o._id.substring(o._id.length-6)}</span></td>
            <td><span class="total">৳${parseFloat(o.totalAmount || 0).toLocaleString()}</span></td>
            <td><span class="date">${dateStr}</span></td>
            <td>
                <button class="action-icon-btn btn-check" title="Approve" onclick="updateOrderStatus('${o._id}', 'Approved')"><i class="fas fa-check"></i></button>
                <button class="action-icon-btn btn-times" title="Cancel" onclick="updateOrderStatus('${o._id}', 'Cancelled')"><i class="fas fa-times"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function renderLatestActiveOrders(orders) {
    const tbody = document.getElementById('visual-active-orders-tbody');
    const badge = document.getElementById('active-orders-badge');
    if(!tbody) return;
    
    const activeOrders = orders.filter(o => o.status === 'Approved' || o.status === 'Processing').sort((a,b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
    if(badge) badge.innerText = activeOrders.length;
    
    const latest = activeOrders.slice(0, 5);
    
    if(latest.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No active orders</td></tr>';
        return;
    }
    
    let html = '';
    latest.forEach(o => {
        const dateStr = new Date(o.orderDate || o.createdAt).toLocaleDateString();
        const phone = o.phone || 'N/A';
        html += `
        <tr>
            <td><span class="phone">${escapeHTML(phone)}</span></td>
            <td><span class="invoice" onclick="goToOrdersTab('ALL')">#${o.orderNumber || o._id.substring(o._id.length-6)}</span></td>
            <td><span class="total">৳${parseFloat(o.totalAmount || 0).toLocaleString()}</span></td>
            <td><span class="date">${dateStr}</span></td>
            <td>
                <button class="action-icon-btn btn-eye" title="View" onclick="goToOrdersTab('ALL')"><i class="fas fa-eye"></i></button>
                <button class="action-icon-btn btn-check" title="Mark Delivered" onclick="updateOrderStatus('${o._id}', 'Delivered')"><i class="fas fa-truck"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

// ==========================================
// USER ACTIVITY & TRACKING ANALYTICS
// ==========================================
let exitPagesChartInstance = null;

async function fetchUserTrackingAnalytics() {
    try {
        const res = await fetchWithAuth('/api/admin/analytics/activity');
        if (!res) return;
        const data = await res.json();
        
        if (data.success) {
            renderExitPagesChart(data.exitPages);
            renderTopClicksTable(data.topClicks);
            renderDeadClicksTable(data.deadClicks);
        }
    } catch (err) {
        console.error("Error fetching analytics:", err);
    }
}

function renderExitPagesChart(exitPages) {
    const ctx = document.getElementById('exitPagesChart');
    if (!ctx) return;

    if (exitPagesChartInstance) {
        exitPagesChartInstance.destroy();
    }

    if (!exitPages || exitPages.length === 0) {
        ctx.style.display = 'none';
        ctx.parentElement.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No exit page data available for the last 7 days.</p>';
        return;
    }

    const labels = exitPages.map(p => p._id || '/');
    const values = exitPages.map(p => p.count);

    exitPagesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Exit Count',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderTopClicksTable(clicks) {
    const tbody = document.getElementById('top-clicks-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!clicks || clicks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No click data available.</td></tr>';
        return;
    }

    clicks.forEach(click => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(click._id.page || '/')}</td>
                <td><span style="background:#e0f7fa; color:#00838f; padding:3px 8px; border-radius:4px; font-size:11px;">${escapeHTML(click._id.element || 'N/A')}</span></td>
                <td>${escapeHTML(click._id.text || '-')}</td>
                <td><strong>${click.count}</strong></td>
            </tr>
        `;
    });
}

function renderDeadClicksTable(deadClicks) {
    const tbody = document.getElementById('dead-clicks-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!deadClicks || deadClicks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No dead clicks recorded. Great job!</td></tr>';
        return;
    }

    deadClicks.forEach(click => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(click._id.page || '/')}</td>
                <td><span style="background:#ffebee; color:#c62828; padding:3px 8px; border-radius:4px; font-size:11px;">${escapeHTML(click._id.element || 'N/A')}</span></td>
                <td>${escapeHTML(click._id.className || '-')}</td>
                <td>${escapeHTML(click._id.text || '-')}</td>
                <td><strong>${click.count}</strong></td>
            </tr>
        `;
    });
}

function renderLowStockCard(products) {
    const container = document.getElementById('low-stock-container');
    if (!container) return;

    const lowStock = products.filter(p => p.stockQuantity <= 5).sort((a, b) => a.stockQuantity - b.stockQuantity);

    if (lowStock.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #4caf50; margin-top: 20px;">All products are well stocked.</div>';
        return;
    }

    let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
    lowStock.forEach(prod => {
        const color = prod.stockQuantity === 0 ? '#dc3545' : '#ffc107';
        html += `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;" title="${prod.name}">
                    ${prod.name}
                </span>
                <span style="background-color: ${color}; color: ${prod.stockQuantity === 0 ? 'white' : 'black'}; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                    ${prod.stockQuantity}
                </span>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

// ==========================================
// 📰 BLOG MANAGEMENT LOGIC
// ==========================================
let adminBlogsList = [];

async function fetchAdminBlogs() {
    try {
        const res = await fetchWithAuth('/api/admin/blogs');
        if (!res) return;
        const data = await res.json();
        if (data.success) {
            adminBlogsList = data.blogs || [];
            updateBlogStats();
            renderAdminBlogs();
        } else {
            showToast(data.message || 'Failed to fetch blogs', 'error');
        }
    } catch (err) {
        console.error("fetchAdminBlogs Error:", err);
        try {
            const fallbackRes = await fetch('/api/blogs');
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success) {
                adminBlogsList = fallbackData.blogs || [];
                updateBlogStats();
                renderAdminBlogs();
            }
        } catch(e) {}
    }
}

function updateBlogStats() {
    const countBadge = document.getElementById('admin-blogs-count');
    const readsBadge = document.getElementById('admin-blogs-reads');
    if (countBadge) countBadge.textContent = adminBlogsList.length;
    if (readsBadge) {
        const totalReads = adminBlogsList.reduce((sum, b) => sum + (b.views || 0), 0);
        readsBadge.textContent = totalReads;
    }
}

function renderAdminBlogs() {
    const tbody = document.getElementById('admin-blogs-table-body');
    if (!tbody) return;

    const searchInput = document.getElementById('admin-blog-search');
    const filterCat = document.getElementById('admin-blog-filter-cat');

    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCat = filterCat ? filterCat.value : 'all';

    const filtered = adminBlogsList.filter(blog => {
        const matchesCat = (selectedCat === 'all' || (blog.category || blog.tag || '').toLowerCase() === selectedCat.toLowerCase());
        const textContent = `${blog.title || ''} ${blog.category || ''} ${blog.tag || ''} ${blog.author || ''} ${blog.excerpt || ''}`.toLowerCase();
        const matchesSearch = !search || textContent.includes(search);
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 40px 20px; color:#64748b;">
                    <i class="fas fa-newspaper" style="font-size:36px; margin-bottom:10px; display:block; opacity:0.4;"></i>
                    <p style="margin:0 0 12px 0; font-size:15px; font-weight:600;">No blogs found matching your criteria.</p>
                    <button class="btn" onclick="openAddBlogModal()" style="width:auto; padding:8px 18px; font-size:13px; margin:0;"><i class="fas fa-plus"></i> Create Blog Post</button>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(blog => {
        const imgUrl = blog.imageUrl || './img/profile_image.jpg';
        const isPublished = blog.isPublished !== false;
        const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${escapeHTML(imgUrl)}" alt="Thumbnail" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
            </td>
            <td>
                <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 2px;">${escapeHTML(blog.title)}</strong>
                <span style="font-size: 12px; color: #64748b; display: block; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(blog.excerpt || blog.description || '')}</span>
                <span style="font-size: 11px; color: #94a3b8;"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
            </td>
            <td>
                <span class="badge" style="background:#fdf2f6; color:#e60050; border:1px solid rgba(230,0,80,0.2); font-weight:700;">${escapeHTML(blog.category || blog.tag || 'Ethnic Trends')}</span>
            </td>
            <td>
                <span style="font-size: 13px; font-weight: 500; color: #334155;">${escapeHTML(blog.author || 'Styling Team')}</span>
            </td>
            <td>
                <span style="font-size: 12px; color: #64748b;"><i class="far fa-clock"></i> ${escapeHTML(blog.readTime || '4 min read')}</span>
            </td>
            <td>
                <span class="badge" style="background:#f1f5f9; color:#0284c7; font-weight:700;"><i class="far fa-eye"></i> ${blog.views || 0}</span>
            </td>
            <td>
                <span class="badge ${isPublished ? 'badge-success' : 'badge-warning'}">${isPublished ? 'Published' : 'Draft'}</span>
            </td>
            <td>
                <div class="table-action-btns">
                    <a href="blog.html" target="_blank" class="btn-icon btn-icon-secondary" title="View Storefront Blog"><i class="fas fa-eye"></i></a>
                    <button class="btn-icon btn-icon-primary" onclick="openEditBlogModal('${blog._id}')" title="Edit Article"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-icon-danger" onclick="deleteAdminBlog('${blog._id}')" title="Delete Article"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddBlogModal() {
    const form = document.getElementById('admin-blog-form');
    if (form) form.reset();
    document.getElementById('blog-form-id').value = '';
    document.getElementById('blog-modal-title').innerHTML = '<i class="fas fa-blog" style="color:var(--primary); margin-right:8px;"></i> Add New Blog Post';
    document.getElementById('blog-form-author').value = 'AVARONI Styling Team';
    document.getElementById('blog-form-readtime').value = '4 min read';
    document.getElementById('blog-form-category').value = 'Ethnic Trends';
    document.getElementById('blog-form-status').value = 'true';
    document.getElementById('blog-image-preview-wrap').style.display = 'none';
    
    const modal = document.getElementById('admin-blog-modal');
    if (modal) modal.style.display = 'flex';
}

function openEditBlogModal(blogId) {
    const blog = adminBlogsList.find(b => b._id === blogId || b.slug === blogId);
    if (!blog) return;

    document.getElementById('blog-form-id').value = blog._id;
    document.getElementById('blog-form-title').value = blog.title || '';
    document.getElementById('blog-form-category').value = blog.category || blog.tag || 'Ethnic Trends';
    document.getElementById('blog-form-author').value = blog.author || 'AVARONI Styling Team';
    document.getElementById('blog-form-readtime').value = blog.readTime || '4 min read';
    document.getElementById('blog-form-status').value = blog.isPublished !== false ? 'true' : 'false';
    document.getElementById('blog-form-excerpt').value = blog.excerpt || blog.description || '';
    document.getElementById('blog-form-content').value = blog.content || blog.description || '';
    document.getElementById('blog-form-image-url').value = blog.imageUrl || '';

    const previewWrap = document.getElementById('blog-image-preview-wrap');
    const previewImg = document.getElementById('blog-image-preview');
    if (blog.imageUrl) {
        previewImg.src = blog.imageUrl;
        previewWrap.style.display = 'block';
    } else {
        previewWrap.style.display = 'none';
    }

    document.getElementById('blog-modal-title').innerHTML = '<i class="fas fa-edit" style="color:var(--primary); margin-right:8px;"></i> Edit Blog Post';
    const modal = document.getElementById('admin-blog-modal');
    if (modal) modal.style.display = 'flex';
}

function closeBlogModal() {
    const modal = document.getElementById('admin-blog-modal');
    if (modal) modal.style.display = 'none';
}

async function deleteAdminBlog(blogId) {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
        return;
    }
    try {
        const res = await fetchWithAuth(`/api/admin/blogs/${blogId}`, { method: 'DELETE' });
        if (!res) return;
        const data = await res.json();
        if (data.success) {
            showToast("Blog deleted successfully.", "success");
            fetchAdminBlogs();
        } else {
            showToast(data.message || "Failed to delete blog", "error");
        }
    } catch (err) {
        console.error("Delete blog error:", err);
        showToast("An error occurred while deleting blog.", "error");
    }
}

async function restorePresetBlogs() {
    if (!confirm("This will restore the 5 default preset fashion & styling blogs into your database. Existing custom blogs will be preserved. Proceed?")) {
        return;
    }
    try {
        const res = await fetchWithAuth('/api/admin/blogs/seed-preset', { method: 'POST' });
        if (!res) return;
        const data = await res.json();
        if (data.success) {
            showToast("Preset blogs restored successfully!", "success");
            fetchAdminBlogs();
        } else {
            showToast(data.message || "Failed to restore preset blogs", "error");
        }
    } catch (err) {
        console.error("Restore preset blogs error:", err);
        showToast("Error connecting to server.", "error");
    }
}

// Attach Blog Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const openAddBtn = document.getElementById('open-add-blog-btn');
    const closeBtn = document.getElementById('close-blog-modal-btn');
    const cancelBtn = document.getElementById('cancel-blog-modal-btn');
    const seedBtn = document.getElementById('admin-seed-blogs-btn');
    const searchInput = document.getElementById('admin-blog-search');
    const filterCat = document.getElementById('admin-blog-filter-cat');
    const blogForm = document.getElementById('admin-blog-form');
    const blogFile = document.getElementById('blog-form-file');
    const blogUrlInput = document.getElementById('blog-form-image-url');

    if (openAddBtn) openAddBtn.addEventListener('click', openAddBlogModal);
    if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeBlogModal);
    if (seedBtn) seedBtn.addEventListener('click', restorePresetBlogs);

    if (searchInput) searchInput.addEventListener('input', renderAdminBlogs);
    if (filterCat) filterCat.addEventListener('change', renderAdminBlogs);

    if (blogFile) {
        blogFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    const previewImg = document.getElementById('blog-image-preview');
                    const previewWrap = document.getElementById('blog-image-preview-wrap');
                    if (previewImg && previewWrap) {
                        previewImg.src = re.target.result;
                        previewWrap.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (blogUrlInput) {
        blogUrlInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            const previewImg = document.getElementById('blog-image-preview');
            const previewWrap = document.getElementById('blog-image-preview-wrap');
            if (val && previewImg && previewWrap) {
                previewImg.src = val;
                previewWrap.style.display = 'block';
            }
        });
    }

    if (blogForm) {
        blogForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const blogId = document.getElementById('blog-form-id').value;
            const title = document.getElementById('blog-form-title').value.trim();
            const category = document.getElementById('blog-form-category').value.trim();
            const author = document.getElementById('blog-form-author').value.trim();
            const readTime = document.getElementById('blog-form-readtime').value.trim();
            const isPublished = document.getElementById('blog-form-status').value === 'true';
            const excerpt = document.getElementById('blog-form-excerpt').value.trim();
            const content = document.getElementById('blog-form-content').value.trim();
            const fileInput = document.getElementById('blog-form-file');
            const imageUrlInput = document.getElementById('blog-form-image-url');

            const submitBtn = document.getElementById('save-blog-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            try {
                let res;
                const file = fileInput && fileInput.files ? fileInput.files[0] : null;

                if (file) {
                    const formData = new FormData();
                    formData.append('title', title);
                    formData.append('category', category);
                    formData.append('tag', category);
                    formData.append('author', author);
                    formData.append('readTime', readTime);
                    formData.append('isPublished', isPublished);
                    formData.append('excerpt', excerpt);
                    formData.append('description', excerpt);
                    formData.append('content', content);
                    formData.append('image', file);

                    const url = blogId ? `/api/admin/blogs/${blogId}` : '/api/admin/blogs';
                    const method = blogId ? 'PUT' : 'POST';

                    res = await fetchWithAuth(url, {
                        method: method,
                        body: formData
                    });
                } else {
                    const bodyData = {
                        title,
                        category,
                        tag: category,
                        author,
                        readTime,
                        isPublished,
                        excerpt,
                        description: excerpt,
                        content,
                        imageUrl: imageUrlInput ? imageUrlInput.value.trim() : './img/profile_image.jpg'
                    };

                    const url = blogId ? `/api/admin/blogs/${blogId}` : '/api/admin/blogs';
                    const method = blogId ? 'PUT' : 'POST';

                    res = await fetchWithAuth(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bodyData)
                    });
                }

                if (!res) return;
                const data = await res.json();

                if (data.success) {
                    showToast(data.message || (blogId ? "Blog updated successfully!" : "Blog published successfully!"), "success");
                    closeBlogModal();
                    fetchAdminBlogs();
                } else {
                    showToast(data.message || "Failed to save blog", "error");
                }
            } catch (err) {
                console.error("Save blog error:", err);
                showToast("An error occurred while saving blog.", "error");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save & Publish';
                }
            }
        });
    }
});
