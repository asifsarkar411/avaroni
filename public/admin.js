// ==========================================
// 🔒 SECURITY CHECK & INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Check if user is logged in
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
        return; // Important: Stops the rest of the script from running if not logged in
    } else {
        showDashboard();
    }

    // 2. Attach Static Event Listeners
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) addCardBtn.addEventListener('click', createNewCard);

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

    // 8. Add Navbar Promo Slider Form Submit
    const addNavSliderForm = document.getElementById('add-nav-slider-form');
    if (addNavSliderForm) {
        addNavSliderForm.addEventListener('submit', handleAddNavSlider);
    }

    // 9. Edit Product Form Submit
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProductSubmit);
    }

    const editCategorySelect = document.getElementById('edit-prod-category');
    if (editCategorySelect) {
        editCategorySelect.addEventListener('change', (e) => {
            populateEditSubcategories(e.target.value);
        });
    }
});

// Helper to convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
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
            alert("Your session has expired or is invalid. Please log in again.");
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

            if (countOrders) countOrders.innerText = data.stats.ordersCount || 0;
            if (countProducts) countProducts.innerText = data.stats.productsCount || 0;
            if (countBanners) countBanners.innerText = data.stats.bannersCount || 0;
            if (countSliders) countSliders.innerText = data.stats.slidersCount || 0;
            if (countReturns) countReturns.innerText = data.stats.returnsCount || 0;
            if (countMessages) countMessages.innerText = data.stats.messagesCount || 0;
            if (totalRevenue) totalRevenue.innerText = Number(data.stats.totalRevenue || 0).toLocaleString();
        }
    } catch (err) {
        console.error("Error loading dashboard stats:", err);
    }
}

function switchTab(tabName) {
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
        if (tabName === 'manage-nav-sliders') cleanTitle = "Manage Navbar Slider";
        if (tabName === 'manage-returns') cleanTitle = "Customer Return Requests";
        if (tabName === 'manage-messages') cleanTitle = "Customer Contact Messages";
        titleElement.innerText = cleanTitle;
    }

    // Fetch data dynamically based on the active tab
    if (tabName === 'dashboard') fetchDashboardStats();
    if (tabName === 'orders') fetchOrders();
    if (tabName === 'manage-products') fetchManageProducts();
    if (tabName === 'add-product') populateAddProductCategories();
    if (tabName === 'manage-categories') renderCategoriesTab();
    if (tabName === 'manage-promocodes') fetchPromoCodes();
    if (tabName === 'manage-banners') loadAdminBanners();
    if (tabName === 'manage-nav-sliders') loadAdminNavSliders();
    if (tabName === 'manage-returns') fetchReturnRequests();
    if (tabName === 'manage-messages') fetchContactMessages();
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
        if (e.target.classList.contains('delete-card-btn')) {
            deleteCard(e.target.getAttribute('data-id'));
        } else if (e.target.classList.contains('save-heading-btn')) {
            updateCardHeading(e.target.getAttribute('data-id'));
        } else if (e.target.classList.contains('delete-img-btn')) {
            deleteImageFromCard(e.target.getAttribute('data-card-id'), e.target.getAttribute('data-img-index'));
        }
    });

    adminCardsContainer.addEventListener('submit', (e) => {
        if (e.target.classList.contains('upload-image-form')) {
            e.preventDefault();
            uploadImageToCard(e.target.getAttribute('data-id'));
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

        if (data.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No products in inventory.</td></tr>';
            return;
        }

        data.products.forEach(prod => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${prod.imageUrl}" width="50" style="object-fit:cover; border-radius:4px;"></td>
                    <td><strong>${prod.name}</strong></td>
                    <td>${prod.category}</td>
                    <td>${prod.size || '-'}</td>
                    <td>${prod.colour || '-'}</td>
                    <td>${prod.brand || '-'}</td>
                    <td style="color:#0d6efd; font-weight:bold;">৳${prod.price}</td>
                    <td>${prod.stockQuantity} Left</td> 
                    <td>${prod.isAvailable ? '<span style="color:green; font-weight:bold;">Available</span>' : '<span style="color:red; font-weight:bold;">Unavailable</span>'}</td>
                    <td>
                        <button data-id="${prod._id}" class="btn edit-btn" style="background:#0d6efd; font-size:12px; width:100%; margin-bottom:4px; padding:5px;"><i class="fas fa-edit"></i> Edit</button>
                        <button data-id="${prod._id}" class="btn toggle-btn" style="background:#333; font-size:12px; width:100%; margin-bottom:4px; padding:5px;"><i class="fas fa-eye-slash"></i> Hide/Show</button>
                        <button data-id="${prod._id}" class="btn delete-btn" style="background:#dc3545; font-size:12px; width:100%; padding:5px;"><i class="fas fa-trash-alt"></i> Delete</button>
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
    if(confirm("Are you sure you want to delete this product?")) {
        try {
            const response = await fetchWithAuth(`/api/admin/products/${id}`, { 
                method: 'DELETE'
            });
            if (response && response.ok) {
                fetchManageProducts();
                fetchDashboardStats();
            }
        } catch(err) {
            console.error("Error deleting product:", err);
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
        alert("Please select a product photo before saving.");
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product to Database';
        return;
    }

    try {
        imageBase64 = await fileToBase64(imageFile);
    } catch (err) {
        console.error("Error reading image:", err);
        alert("Failed to read image file. Please try a different photo.");
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product to Database';
        return;
    }

    const payload = {
        name: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        category: document.getElementById('prod-category').value,
        subcategory: document.getElementById('prod-subcategory').value,
        size: document.getElementById('prod-size') ? document.getElementById('prod-size').value : '',
        colour: document.getElementById('prod-colour') ? document.getElementById('prod-colour').value : '',
        brand: document.getElementById('prod-brand') ? document.getElementById('prod-brand').value : '',
        stock: document.getElementById('prod-stock').value,
        image: imageBase64
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Product added successfully!');
            document.getElementById('add-product-form').reset();
            fetchManageProducts(); // Refresh the list instantly
        } else {
            alert('Failed to save product: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error saving product:", err);
        alert("An error occurred connecting to the server.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Product to Database';
    }
}

// ==========================================
// ORDER MANAGEMENT
// ==========================================

async function fetchOrders() {
    try {
        const response = await fetch('/api/admin/orders', {
            headers: getAuthHeaders()
        });
        
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        if (response.status === 401 || response.status === 403) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Unauthorized: Please log out and log back in.</td></tr>';
            return;
        }

        const data = await response.json();
        tbody.innerHTML = '';

        if (!data.orders || data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No orders found.</td></tr>';
            return;
        }

        data.orders.forEach(order => {
            const date = new Date(order.orderDate).toLocaleString();
            const itemsList = order.cartItems.map(item => `${item.name} (x${item.quantity})`).join(', ');
            
            // Fallback to "N/A" if orderNumber wasn't generated for older orders
            const displayOrderNum = order.orderNumber || 'N/A'; 
            
            tbody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td style="color: #007bff; font-weight: bold;">${displayOrderNum}</td> 
                    
                    <td><strong>${order.customerName}</strong></td>
                    <td>${order.phone}<br>${order.email}</td>
                    <td>${order.address}</td>
                    <td><strong>${order.transactionId || 'N/A'}</strong></td>
                    <td style="color:#e60050; font-weight:bold;">৳${order.totalAmount}</td>
                    <td class="items-list">${itemsList}</td>
                    <td>
                        <button onclick="downloadInvoice('${order.orderNumber}')" class="btn" style="margin-top:0; padding: 6px 12px; font-size:12px; background:#e60050; color:white; border:none; border-radius:4px; cursor:pointer;"><i class="fas fa-file-invoice"></i> Invoice</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { // <-- ADDED: Catch block and closing braces were missing here
        console.error("Error fetching orders:", error);
    }
}

// ==========================================
// 🌟 MULTIPLE BANNER CARDS LOGIC 🌟
// ==========================================

async function loadAdminBanners() {
    const container = document.getElementById('admin-cards-container');
    if(!container) return; 

    try {
        const response = await fetch('/api/banner-cards', {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        container.innerHTML = ''; 
        
        if(!data.cards || data.cards.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No slider cards yet. Click "+ Add New Carousel Card" above!</p>';
            return;
        }

        data.cards.forEach((card, index) => {
            let imagesHtml = '';
            card.images.forEach((imgUrl, imgIndex) => {
                imagesHtml += `
                    <div style="position: relative; width: 150px; border: 1px solid #ccc; border-radius: 5px; overflow: hidden;">
                        <img src="${imgUrl}" style="width: 100%; height: 100px; object-fit: cover; display: block;">
                        <button data-card-id="${card._id}" data-img-index="${imgIndex}" class="delete-img-btn" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; padding: 2px 6px; cursor: pointer; border-radius: 3px;">X</button>
                    </div>
                `;
            });

            container.innerHTML += `
                <div style="background: #fdfdfd; border: 2px dashed #ccc; padding: 20px; border-radius: 8px; position: relative; margin-bottom: 20px;">
                    <h3 style="margin-top:0;">Slider Card #${index + 1}</h3>
                    <button data-id="${card._id}" class="delete-card-btn" style="position: absolute; top: 20px; right: 20px; background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Delete Entire Card</button>
                    
                    <div style="margin: 15px 0; background: #f1f1f1; padding: 10px; border-radius: 5px;">
                        <label style="font-weight: bold; display: block; margin-bottom: 5px;">Card Heading Title:</label>
                        <input type="text" id="heading-${card._id}" value="${card.heading || ''}" placeholder="e.g. Winter Collection" style="padding: 5px; width: 60%; border: 1px solid #ccc;">
                        <button data-id="${card._id}" class="btn save-heading-btn" style="padding: 5px 15px; margin-top: 0; width: auto; background: #17a2b8;">Save Title</button>
                    </div>

                    <form data-id="${card._id}" class="upload-image-form" style="margin: 15px 0; display: flex; gap: 10px;">
                        <input type="file" id="file-${card._id}" accept="image/*" required style="padding: 5px; border: 1px solid #ccc;">
                        <button type="submit" class="btn" style="margin-top: 0; width: auto; padding: 5px 15px;">Add Image to this Slider</button>
                    </form>

                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${imagesHtml || '<p style="color:#777; font-size:14px;">No images in this slider yet.</p>'}
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error loading banners:", err);
    }
}

async function updateCardHeading(cardId) {
    const headingValue = document.getElementById(`heading-${cardId}`).value;
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
        if(data.success) {
            alert('Heading saved successfully!');
        }
    } catch (err) {
        console.error("Error saving heading:", err);
        alert('Error saving heading');
    }
}

async function createNewCard() {
    try {
        await fetch('/api/banner-cards', { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders() 
            }
        });
        loadAdminBanners();
    } catch (err) { 
        console.error("Error creating card:", err);
        alert('Error creating card'); 
    }
}

async function deleteCard(cardId) {
    if(!confirm("Delete this ENTIRE slider card and all its images?")) return;
    try {
        await fetch(`/api/banner-cards/${cardId}`, { 
            method: 'DELETE',
            headers: getAuthHeaders() 
        });
        loadAdminBanners();
    } catch (err) { 
        console.error("Error deleting card:", err);
        alert('Error deleting card'); 
    }
}

async function uploadImageToCard(cardId) {
    const fileInput = document.getElementById(`file-${cardId}`);
    const file = fileInput.files[0];
    if (!file) return;

    try {
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
            loadAdminBanners(); 
        } else {
            alert('Failed to upload banner: ' + (data.message || 'Unknown error'));
        }
    } catch (err) { 
        console.error("Error uploading image:", err);
        alert('Error uploading image'); 
    }
}

async function deleteImageFromCard(cardId, imageIndex) {
    if(!confirm("Remove this image?")) return;
    try {
        await fetch(`/api/banner-cards/${cardId}/images/${imageIndex}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        loadAdminBanners();
    } catch (err) { 
        console.error("Error deleting image:", err);
        alert('Error deleting image'); 
    }
}



// ==========================================
// 🏷️ CATEGORY MANAGEMENT HELPERS
// ==========================================
let localCategories = [];

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
            localCategories = data.categories;
            populateAddProductCategories();
        }
    } catch (err) {
        console.error("Error loading categories:", err);
    }
}

async function populateAddProductCategories() {
    const catSelect = document.getElementById('prod-category');
    if (!catSelect) return;

    if (localCategories.length === 0) {
        await loadCategories();
    }

    catSelect.innerHTML = `<option value="" disabled selected>Select Category</option>`;
    localCategories.forEach(cat => {
        catSelect.innerHTML += `<option value="${cat.slug}">${cat.displayName}</option>`;
    });

    const subSelect = document.getElementById('prod-subcategory');
    if (subSelect) {
        subSelect.innerHTML = `<option value="" disabled selected>Select Subcategory</option>`;
    }
}

function populateSubcategories(categorySlug) {
    const subSelect = document.getElementById('prod-subcategory');
    if (!subSelect) return;

    const category = localCategories.find(c => c.slug === categorySlug);
    if (!category || !category.subcategories || category.subcategories.length === 0) {
        subSelect.innerHTML = `<option value="" disabled selected>No subcategories found. Add them in Manage Categories tab.</option>`;
        return;
    }

    subSelect.innerHTML = `<option value="" disabled selected>Select Subcategory</option>`;
    category.subcategories.forEach(sub => {
        subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

async function renderCategoriesTab() {
    const container = document.getElementById('categories-list-container');
    if (!container) return;

    await loadCategories(); // Refresh categories list

    container.innerHTML = '';
    
    if (localCategories.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#666;">No categories found. Add one above.</p>`;
        return;
    }

    localCategories.forEach(cat => {
        let subListHtml = '';
        if (cat.subcategories && cat.subcategories.length > 0) {
            cat.subcategories.forEach(sub => {
                subListHtml += `
                    <span style="display: inline-flex; align-items: center; background: #ffe6eb; border: 1px solid #e60050; border-radius: 15px; padding: 4px 12px; margin: 5px; font-size: 13px; font-weight: 600; color: #e60050;">
                        ${sub}
                        <i class="fas fa-times" onclick="deleteSubcategory('${cat._id}', '${sub}')" style="margin-left: 8px; cursor: pointer; color: #c50044;"></i>
                    </span>
                `;
            });
        } else {
            subListHtml = `<p style="margin: 0; color: #888; font-size: 13px; font-style: italic;">No subcategories added yet.</p>`;
        }

        container.innerHTML += `
            <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 5px solid #e60050; color: #333;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #333;">${cat.displayName} <span style="font-size: 12px; color: #888; font-weight: normal; margin-left: 10px;">(Slug: ${cat.slug})</span></h3>
                    <button class="btn" onclick="deleteCategory('${cat._id}')" style="margin-top:0; width:auto; padding: 5px 10px; font-size: 12px; background: #333; color: #fff;">Delete Category</button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #555;">Subcategories:</h4>
                    <div style="display: flex; flex-wrap: wrap; align-items: center;">
                        ${subListHtml}
                    </div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                    <input type="text" id="new-sub-${cat._id}" placeholder="New Subcategory name" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px;">
                    <button class="btn" onclick="handleAddSubcategory('${cat._id}')" style="margin-top:0; width:auto; padding: 8px 15px; font-size: 13px; background: #e60050; color: #fff;">Add Subcategory</button>
                </div>
            </div>
        `;
    });
}

async function handleAddCategory(e) {
    e.preventDefault();
    const input = document.getElementById('new-cat-name');
    const name = input.value.trim();
    if (!name) return;

    try {
        const response = await fetchWithAuth('/api/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ displayName: name })
        });
        if (!response) return;
        const data = await response.json();
        if (data.success) {
            alert('Category added successfully!');
            input.value = '';
            renderCategoriesTab();
        } else {
            alert('Failed to add category: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error adding category:", err);
        alert('An error occurred connecting to the server.');
    }
}

async function handleAddSubcategory(catId) {
    const input = document.getElementById(`new-sub-${catId}`);
    if (!input) return;
    const name = input.value.trim();
    if (!name) {
        alert("Please enter a subcategory name.");
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/admin/categories/${catId}/subcategories`, {
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
            renderCategoriesTab();
        } else {
            alert('Failed to add subcategory: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error adding subcategory:", err);
        alert('An error occurred connecting to the server.');
    }
}

async function deleteSubcategory(catId, subName) {
    if (!confirm(`Remove subcategory "${subName}"?`)) return;
    try {
        const response = await fetchWithAuth(`/api/admin/categories/${catId}/subcategories/${encodeURIComponent(subName)}`, {
            method: 'DELETE'
        });
        if (!response) return;
        const data = await response.json();
        if (data.success) {
            renderCategoriesTab();
        } else {
            alert('Failed to remove subcategory: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error deleting subcategory:", err);
        alert('An error occurred connecting to the server.');
    }
}

async function deleteCategory(catId) {
    if (!confirm("Are you sure you want to delete this Category? All its subcategories will be removed.")) return;
    try {
        const response = await fetchWithAuth(`/api/admin/categories/${catId}`, {
            method: 'DELETE'
        });
        if (!response) return;
        const data = await response.json();
        if (data.success) {
            renderCategoriesTab();
        } else {
            alert('Failed to delete category: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error deleting category:", err);
        alert('An error occurred connecting to the server.');
    }
}

// Attach actions to global context
window.deleteCategory = deleteCategory;
window.deleteSubcategory = deleteSubcategory;
window.handleAddSubcategory = handleAddSubcategory;

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
                    <td><strong>${promo.code}</strong></td>
                    <td style="text-transform: capitalize;">${promo.discountType}</td>
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
        alert("Please enter valid promo code information.");
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
            alert('Promo Code created successfully!');
            document.getElementById('add-promo-form').reset();
            fetchPromoCodes();
        } else {
            alert('Failed to create promo code: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error saving promo code:", err);
        alert("An error occurred connecting to the server.");
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
            alert('Failed to delete promo code: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error deleting promo code:", err);
        alert('An error occurred connecting to the server.');
    }
}

// Expose actions to global context
window.deletePromoCode = deletePromoCode;

// ==========================================
// NAVBAR PROMO SLIDER MANAGEMENT
// ==========================================

async function loadAdminNavSliders() {
    const tbody = document.getElementById('nav-sliders-table-body');
    if (!tbody) return;

    try {
        const response = await fetch('/api/nav-sliders');
        const data = await response.json();

        tbody.innerHTML = '';

        if (!data.success || !data.sliders || data.sliders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No navbar slider images configured yet.</td></tr>';
            return;
        }

        data.sliders.forEach(slider => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${slider.imageUrl}" style="max-height: 50px; max-width: 150px; object-fit: contain; border-radius: 4px; border: 1px solid #eee;"></td>
                    <td>${slider.link || '<span style="color:#aaa; font-style:italic;">None</span>'}</td>
                    <td><strong>${slider.order}</strong></td>
                    <td>
                        <button class="btn" style="background:#e60050; padding:6px 12px; font-size:12px; margin:0;" onclick="deleteNavSlider('${slider._id}')"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error fetching navbar sliders:", err);
    }
}

async function handleAddNavSlider(e) {
    e.preventDefault();
    const fileInput = document.getElementById('nav-slider-image-file');
    const linkInput = document.getElementById('nav-slider-link');
    const orderInput = document.getElementById('nav-slider-order');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a promo image file.");
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Uploading...";

        const base64Image = await fileToBase64(fileInput.files[0]);
        const payload = {
            imageData: base64Image,
            link: linkInput.value.trim(),
            order: parseInt(orderInput.value) || 0
        };

        const response = await fetch('/api/nav-sliders', {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.success) {
            alert("Navbar promo image uploaded successfully!");
            e.target.reset();
            loadAdminNavSliders();
        } else {
            alert("Failed to upload promo image: " + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error uploading nav slider image:", err);
        alert("An error occurred during upload.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Upload & Add to Navbar";
    }
}

async function deleteNavSlider(id) {
    if (!confirm("Are you sure you want to delete this navbar promotional slider image?")) return;

    try {
        const response = await fetch(`/api/nav-sliders/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (data.success) {
            loadAdminNavSliders();
        } else {
            alert("Failed to delete nav slider: " + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error deleting nav slider:", err);
        alert("An error occurred connecting to the server.");
    }
}

// Expose actions to global context
window.deleteNavSlider = deleteNavSlider;

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
                    <td style="color:#007bff; font-weight:bold;">${ret.orderNumber}</td>
                    <td>${ret.email}</td>
                    <td><strong>${ret.reason}</strong></td>
                    <td style="font-size:13px; color:#555; max-width:250px; word-wrap:break-word;">${ret.details || '-'}</td>
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
            alert(`Return request was ${status} successfully! Customer has been notified by email.`);
            fetchReturnRequests(); // Refresh the list
        } else {
            alert("Failed to update status: " + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error updating return request status:", err);
        alert("An error occurred connecting to the server.");
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
                    <td><strong>${msg.name}</strong></td>
                    <td>${msg.email}</td>
                    <td style="font-size:13px; color:#555; max-width:350px; word-wrap:break-word;">${msg.message}</td>
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
            alert("Failed to mark message as read: " + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error marking message as read:", err);
        alert("An error occurred connecting to the server.");
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
            alert("Message deleted successfully!");
            fetchContactMessages(); // Refresh the list
            fetchDashboardStats();  // Update dashboard counter
        } else {
            alert("Failed to delete message: " + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error deleting message:", err);
        alert("An error occurred connecting to the server.");
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
        alert("Product details not found. Please refresh the inventory table.");
        return;
    }

    document.getElementById('edit-prod-id').value = prod._id;
    document.getElementById('edit-prod-name').value = prod.name;
    document.getElementById('edit-prod-price').value = prod.price;
    document.getElementById('edit-prod-stock').value = prod.stockQuantity;
    document.getElementById('edit-prod-size').value = prod.size || '';
    document.getElementById('edit-prod-colour').value = prod.colour || '';
    document.getElementById('edit-prod-brand').value = prod.brand || '';
    document.getElementById('edit-prod-preview').src = prod.imageUrl;
    document.getElementById('edit-prod-image').value = '';

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
        subSelect.innerHTML = `<option value="" selected>No subcategories</option>`;
        return;
    }

    subSelect.innerHTML = `<option value="" ${!selectedSubcat ? 'selected' : ''}>Select Subcategory</option>`;
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
            alert("Failed to read new image file.");
            saveBtn.disabled = false;
            saveBtn.innerText = 'Save Changes';
            return;
        }
    }

    const payload = {
        name: document.getElementById('edit-prod-name').value,
        price: document.getElementById('edit-prod-price').value,
        category: document.getElementById('edit-prod-category').value,
        subcategory: document.getElementById('edit-prod-subcategory').value,
        size: document.getElementById('edit-prod-size').value,
        colour: document.getElementById('edit-prod-colour').value,
        brand: document.getElementById('edit-prod-brand').value,
        stock: document.getElementById('edit-prod-stock').value,
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
            alert('Product updated successfully!');
            closeEditModal();
            fetchManageProducts();
        } else {
            alert('Failed to update product: ' + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error("Error updating product:", err);
        alert("An error occurred connecting to the server.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Changes';
    }
}

// Expose modal handlers to global context
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;