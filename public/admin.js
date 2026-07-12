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
            const targetTab = event.target.getAttribute('data-target');
            switchTab(targetTab);
        });
    });

    // 4. Add Product Form Submit
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
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

// ==========================================
// CORE FUNCTIONS
// ==========================================

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html'; 
}

function showDashboard() {
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        dashboardSection.style.display = 'block'; 
    }
    
    // Load default data on startup
    fetchOrders();
    loadAdminBanners(); 
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const targetBtn = document.querySelector(`button[data-target="${tabName}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) targetTab.classList.add('active');

    // Fetch data dynamically based on the active tab
    if (tabName === 'orders') fetchOrders();
    if (tabName === 'manage-products') fetchManageProducts();
    if (tabName === 'manage-banners') loadAdminBanners();
}

// ==========================================
// DYNAMIC EVENT DELEGATORS
// ==========================================

const manageTableBody = document.getElementById('manage-table-body');
if (manageTableBody) {
    manageTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-btn')) {
            toggleAvailability(e.target.getAttribute('data-id'));
        } else if (e.target.classList.contains('delete-btn')) {
            deleteProduct(e.target.getAttribute('data-id'));
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
        const response = await fetch('/api/admin/products', {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        const tbody = document.getElementById('manage-table-body');
        
        if (!tbody) return;
        tbody.innerHTML = '';

        if (data.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products in inventory.</td></tr>';
            return;
        }

        data.products.forEach(prod => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${prod.imageUrl}" width="50" style="object-fit:cover;"></td>
                    <td>${prod.name}</td>
                    <td>${prod.category}</td>
                    <td>৳${prod.price}</td>
                    <td>${prod.stockQuantity} Left</td> 
                    <td>${prod.isAvailable ? '<span style="color:green">Available</span>' : '<span style="color:red">Unavailable</span>'}</td>
                    <td>
                        <button data-id="${prod._id}" class="btn toggle-btn" style="background:#333; font-size:12px; width:100%; margin-bottom:5px; padding: 5px;">Hide/Show</button>
                        <button data-id="${prod._id}" class="btn delete-btn" style="background:red; font-size:12px; width:100%; padding: 5px;">Delete</button>
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
        await fetch(`/api/admin/products/${id}/toggle`, { 
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        fetchManageProducts();
    } catch(err) {
        console.error("Error toggling availability:", err);
    }
}

async function deleteProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        try {
            await fetch(`/api/admin/products/${id}`, { 
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            fetchManageProducts();
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
    
    if (imageFile) {
        try {
            imageBase64 = await fileToBase64(imageFile);
        } catch (err) {
            console.error("Error reading image:", err);
            alert("Failed to read image file.");
            saveBtn.disabled = false;
            saveBtn.innerText = 'Save Product to Database';
            return;
        }
    }

    const payload = {
        name: document.getElementById('prod-name').value,
        price: document.getElementById('prod-price').value,
        category: document.getElementById('prod-category').value,
        subcategory: document.getElementById('prod-subcategory').value,
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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders found.</td></tr>';
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
// SECURITY: AUTO-LOGOUT ON INACTIVITY
// ==========================================
function setupIdleTimeout() {
    let idleTimer;
    const idleTimeLimit = 2 * 60 * 1000; // 2 minutes in milliseconds (120,000 ms)

    // The function that runs when the user is idle too long
    function logoutUser() {
        // Clear the admin token to ensure they are actually logged out
        localStorage.removeItem('adminToken'); 
        
        // Optional: show a quick alert before redirecting
        alert("You have been logged out due to 2 minutes of inactivity.");
        
        // Redirect to the login page
        window.location.href = 'admin-login.html';
    }

    // The function that resets the timer every time the user does something
    function resetTimer() {
        clearTimeout(idleTimer); // Stop the current countdown
        idleTimer = setTimeout(logoutUser, idleTimeLimit); // Start a fresh 2-minute countdown
    }

    // Listen for all types of user activity to reset the timer
    window.onload = resetTimer;
    document.onmousemove = resetTimer;   // Mouse movement
    document.onkeypress = resetTimer;    // Typing
    document.onclick = resetTimer;       // Clicking
    document.onscroll = resetTimer;      // Scrolling
    document.ontouchstart = resetTimer;  // Tapping on touch screens
}

// Start the tracker immediately
setupIdleTimeout();