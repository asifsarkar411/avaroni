// ==========================================
// PRODUCTS & CART LOGIC
// ==========================================

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

// ==========================================
// 🔍 INTERACTIVE HIGH-RES PRODUCT IMAGE ZOOM
// ==========================================
function initInteractiveZoom(img) {
    if (!img || img.dataset.zoomInitialized) return;
    img.dataset.zoomInitialized = "true";

    const container = img.parentElement;
    if (!container) return;

    container.style.overflow = "hidden";
    container.style.cursor = "zoom-in";

    function handleZoomMove(clientX, clientY) {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        // Clamp values between 0% and 100%
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = "scale(2.2)";
    }

    function resetZoom() {
        img.style.transform = "scale(1)";
        img.style.transformOrigin = "center center";
    }

    // Desktop: Mouse hover and move
    container.addEventListener("mousemove", (e) => {
        handleZoomMove(e.clientX, e.clientY);
    });
    container.addEventListener("mouseleave", resetZoom);

    // Mobile: Touch and drag finger
    container.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length > 0) {
            handleZoomMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches.length > 0) {
            handleZoomMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    container.addEventListener("touchend", resetZoom);
    container.addEventListener("touchcancel", resetZoom);
}

// Scan and bind zoom to all product images on the page
function bindAllProductZoomEffects() {
    document.querySelectorAll('.product-image-wrap .product-image, .product-modal-image img')
        .forEach(img => initInteractiveZoom(img));
}
// Function to load products dynamically from the database
async function loadProducts(category) {
    const productContainer = document.getElementById('product-list') || document.getElementById('products-container');
    if (!productContainer) return; 

    // Render skeleton placeholders while fetching products
    productContainer.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
    `;

    try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();

        if (data.success) {
            const allProducts = data.products;
            
            if(allProducts.length === 0) {
                productContainer.innerHTML = `<p style="text-align:center; width:100%;">No products found in this category yet. Check back soon!</p>`;
                return;
            }

            // Check for ?sub= URL parameter to auto-filter
            const urlParams = new URLSearchParams(window.location.search);
            const urlSub = urlParams.get('sub');
            let initialFilter = 'all';

            // Extract unique subcategories from these products (case-insensitive deduplication)
            const subcategories = [];
            allProducts.forEach(p => {
                if (p.subcategory && p.subcategory.trim()) {
                    const subClean = p.subcategory.trim();
                    if (!subcategories.some(s => s.toLowerCase() === subClean.toLowerCase())) {
                        subcategories.push(subClean);
                    }
                }
            });

            // Create or update Subcategory filter container
            let filterContainer = document.getElementById('subcategory-filters');
            if (subcategories.length > 0) {
                if (!filterContainer) {
                    filterContainer = document.createElement('div');
                    filterContainer.id = 'subcategory-filters';
                    filterContainer.className = 'filter-container';
                    productContainer.parentNode.insertBefore(filterContainer, productContainer);
                }

                // If URL has ?sub= parameter, set the initial filter
                if (urlSub) {
                    const matchedSub = subcategories.find(s => s.toLowerCase() === urlSub.toLowerCase());
                    if (matchedSub) {
                        initialFilter = matchedSub.toLowerCase();
                    }
                }

                // Render filter buttons
                filterContainer.innerHTML = `<button class="filter-btn ${initialFilter === 'all' ? 'active' : ''}" data-sub="all">All</button>`;
                subcategories.forEach(sub => {
                    const isActive = sub.toLowerCase() === initialFilter ? 'active' : '';
                    filterContainer.innerHTML += `<button class="filter-btn ${isActive}" data-sub="${sub.toLowerCase()}">${sub}</button>`;
                });

                // Attach click handlers to the filter buttons
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        const selectedSub = e.target.getAttribute('data-sub');
                        
                        renderFilteredProducts(allProducts, selectedSub, productContainer);
                    });
                });
            } else if (filterContainer) {
                filterContainer.remove(); // Clean up if no subcategories exist
            }

            // Initially render products (filtered if ?sub= param exists)
            window.currentMasterProducts = allProducts;
            renderFilteredProducts(allProducts, initialFilter, productContainer);
        }
    } catch (error) {
        console.error("Error loading products:", error);
        productContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load products. Is the server running?</p>`;
    }
}

// Helper function to render a list of products
function renderFilteredProducts(products, subcategoryFilter, container) {
    container.innerHTML = '';
    
    let filtered = subcategoryFilter === 'all' 
        ? [...products] 
        : products.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === subcategoryFilter);

    // Apply global filter & sort selection if active
    const filterSelect = document.getElementById('global-filter-select');
    if (filterSelect) {
        const val = filterSelect.value;
        if (val.startsWith('sub:') && subcategoryFilter === 'all') {
            const targetSub = val.replace('sub:', '').toLowerCase();
            filtered = filtered.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === targetSub);
        }
        if (val === 'price-asc') {
            filtered.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (val === 'price-desc') {
            filtered.sort((a, b) => Number(b.price) - Number(a.price));
        }
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; color: #666; margin-top: 20px;">No products found in this category.</p>`;
        return;
    }

    filtered.forEach(product => {
        const fullImageUrl = formatImageUrl(product.imageUrl);
        const stockText = product.stockQuantity > 0 
            ? `<div class="stock-status in-stock"><i class="fas fa-check-circle"></i> In Stock: ${product.stockQuantity}</div>` 
            : `<div class="stock-status out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</div>`;
        const btnStatus = product.stockQuantity > 0 ? "" : "disabled style='background:grey;'";

        const inWishlist = isInWishlist(product._id);
        const heartClass = inWishlist ? "fas fa-heart" : "far fa-heart";
        const activeClass = inWishlist ? "active" : "";

        container.innerHTML += `
            <div class="product-card" data-product-id="${product._id}">
                <div class="product-image-wrap">
                    <button class="wishlist-card-btn ${activeClass}" data-id="${product._id}" title="${inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}">
                        <i class="${heartClass}"></i>
                    </button>
                    <img src="${fullImageUrl}" alt="${product.name}" class="product-image" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
                </div>
                <h3>${escapeHTML(product.name)}</h3>
                <p class="price">৳${product.price}</p>
                ${stockText}
                <button class="btn add-to-cart-btn" ${btnStatus} 
                    data-id="${product._id}" 
                    data-name="${product.name.replace(/"/g, '&quot;')}" 
                    data-price="${product.price}" 
                    data-image="${fullImageUrl}" 
                    data-stock="${product.stockQuantity}">Add to Cart</button>
            </div>
        `;
    });

    bindAllProductZoomEffects();
}

// Unique cart session ID generation per tab/session to avoid different tabs/customers sharing the same cart
function getSessionCartKey() {
    let sessionId = sessionStorage.getItem('cart_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
        sessionStorage.setItem('cart_session_id', sessionId);
    }
    return `cart_${sessionId}`;
}

const cartKey = getSessionCartKey();
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

function addToCart(id, name, price, image, maxStock) {
    let existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        const stockLimit = existingItem.maxStock || maxStock || Infinity; 
        
        if (existingItem.quantity < stockLimit) {
            existingItem.quantity += 1;
        } else {
            alert(`Sorry, we only have ${stockLimit} of these in stock!`);
            return; 
        }
    } else {
        cart.push({ id, name, price, image, quantity: 1, maxStock }); 
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartBadge();
    window.location.href = 'cart.html';
}

function togglePaymentDetails() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedMethod) return; 

    const method = selectedMethod.value;
    const bkashDetails = document.getElementById('bkash-details');
    const codDetails = document.getElementById('cod-details');
    const trxInput = document.getElementById('trx-id');

    if (method === 'bkash') {
        if(bkashDetails) bkashDetails.style.display = 'block';
        if(codDetails) codDetails.style.display = 'none';
        if(trxInput) trxInput.setAttribute('required', 'true'); 
    } else if (method === 'cod') {
        if(bkashDetails) bkashDetails.style.display = 'none';
        if(codDetails) codDetails.style.display = 'block';
        if(trxInput) trxInput.removeAttribute('required'); 
    }
    
    renderCart(); 
}

function renderCart() {
    updateCartBadge();

    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('shipping-charge');
    const discountRow = document.getElementById('discount-row');
    const promoDiscountElement = document.getElementById('promo-discount');

    if (!cartContainer && !totalElement) return;

    if (cartContainer) cartContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        if (cartContainer) cartContainer.innerHTML = '<p style="text-align:center; padding: 30px; color: #888;">Your cart is empty. <a href="index.html" style="color:#111111; font-weight:700;">Start shopping!</a></p>';
        if (totalElement) totalElement.innerText = '0';
        if (subtotalElement) subtotalElement.innerText = '0';
        if (shippingElement) shippingElement.innerText = '0';
        if (discountRow) discountRow.style.display = 'none';
        // Hide proceed button when cart is empty
        const proceedBtn = document.getElementById('proceed-to-payment-btn');
        if (proceedBtn) proceedBtn.style.display = 'none';
        updateCartBadge();
        return;
    }

    // Show proceed button when cart has items
    const proceedBtn = document.getElementById('proceed-to-payment-btn');
    if (proceedBtn) proceedBtn.style.display = '';

    cart.forEach(item => {
        let itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;
        if (cartContainer) {
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">
                    <div class="cart-item-info">
                        <h4>${escapeHTML(item.name)}</h4>
                        <span class="cart-item-unit-price">৳${escapeHTML(item.price)} each</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn qty-decrease" data-id="${escapeHTML(item.id)}">-</button>
                        <span>${escapeHTML(item.quantity)}</span>
                        <button class="qty-btn qty-increase" data-id="${escapeHTML(item.id)}">+</button>
                    </div>
                    <strong class="cart-item-total">৳${itemTotal}</strong>
                    <button class="cart-remove-btn remove-btn" data-id="${escapeHTML(item.id)}" title="Remove item"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }
    });

    // Shipping fee based on delivery location
    const deliveryRadio = document.querySelector('input[name="deliveryLocation"]:checked');
    let shippingFee = 0;
    if (deliveryRadio) {
        shippingFee = deliveryRadio.value === 'inside' ? 80 : 150;
    }

    // Promo discount handling (uses API-validated values)
    let discount = 0;
    if (window.appliedPromoCode && window.appliedPromoType && window.appliedPromoValue) {
        if (window.appliedPromoType === 'percentage') {
            discount = subtotal * (window.appliedPromoValue / 100);
        } else if (window.appliedPromoType === 'fixed') {
            discount = window.appliedPromoValue;
        }
        // Don't let discount exceed subtotal + shipping
        if (discount > subtotal + shippingFee) {
            discount = subtotal + shippingFee;
        }
    }

    // Update UI displays
    if (subtotalElement) subtotalElement.innerText = subtotal.toFixed(2).replace(/\.00$/, '');
    if (shippingElement) shippingElement.innerText = shippingFee.toFixed(2).replace(/\.00$/, '');
    if (discountRow) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            if (promoDiscountElement) promoDiscountElement.innerText = discount.toFixed(2).replace(/\.00$/, '');
        } else {
            discountRow.style.display = 'none';
        }
    }
    const total = subtotal + shippingFee - discount;
    if (totalElement) totalElement.innerText = total.toFixed(2).replace(/\.00$/, '');

    updateCartBadge();
}

function changeQty(id, change) {
    let item = cart.find(i => i.id === id);
    if (item) {
        const stockLimit = item.maxStock || Infinity;

        if (change > 0 && item.quantity >= stockLimit) {
            alert(`Sorry, we only have ${stockLimit} of these in stock!`);
            return;
        }

        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id); 
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
        renderCart(); 
        updateCartBadge();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
    updateCartBadge();
}

// Function to update cart badge indicators dynamically
function updateCartBadge() {
    const cartIcons = document.querySelectorAll('.cart-icon');
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartIcons.forEach(icon => {
        const existingBadge = icon.querySelector('.cart-badge');
        if (existingBadge) existingBadge.remove();

        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.innerText = totalItems;
            icon.appendChild(badge);
        }
    });
}

// ==========================================
// DYNAMIC CATEGORY NAVBAR BUILDER
// Maps category slugs to their page files (hardcoded legacy pages)
// Any category NOT in this map will use the dynamic category.html?cat=<slug> page
const categoryPageMap = {
    'women': 'women.html',
    'womendress': 'women.html',
    'ornament': 'ornament.html',
    'kids': 'kids.html',
    'kidszone': 'kids.html'
};

function getCategoryPageUrl(slug, name) {
    return categoryPageMap[slug] || categoryPageMap[name] || `category.html?cat=${slug}`;
}

async function loadNavCategories() {
    const navLinksContainer = document.querySelector('.nav-links');
    if (!navLinksContainer) return;

    try {
        const response = await fetch('/api/categories', { cache: 'no-store' });
        const data = await response.json();
        if (!data.success || !data.categories) return;

        // Preserve the wishlist icon, cart icon, and menu icon from the nav-links
        const wishlistIcon = navLinksContainer.querySelector('.wishlist-icon');
        const cartIcon = navLinksContainer.querySelector('.cart-icon');
        const menuIcon = navLinksContainer.querySelector('.menu-icon');

        // Clear existing category links (keep wishlist/cart/menu)
        navLinksContainer.innerHTML = '';

        data.categories.forEach(cat => {
            const pageFile = getCategoryPageUrl(cat.slug, cat.name);
            const isDynamic = pageFile.startsWith('category.html');

            if (cat.subcategories && cat.subcategories.length > 0) {
                // Create dropdown wrapper
                const dropdown = document.createElement('div');
                dropdown.className = 'nav-dropdown';

                const mainLink = document.createElement('a');
                mainLink.href = pageFile;
                mainLink.innerHTML = `<b>${cat.displayName.toUpperCase()}</b>`;
                dropdown.appendChild(mainLink);

                const dropContent = document.createElement('div');
                dropContent.className = 'nav-dropdown-content';

                // "All" option
                const allLink = document.createElement('a');
                allLink.href = pageFile;
                allLink.textContent = `All ${cat.displayName}`;
                dropContent.appendChild(allLink);

                cat.subcategories.forEach(sub => {
                    const subLink = document.createElement('a');
                    subLink.href = isDynamic 
                        ? `category.html?cat=${cat.slug}&sub=${encodeURIComponent(sub)}`
                        : `${pageFile}?sub=${encodeURIComponent(sub)}`;
                    subLink.textContent = sub;
                    dropContent.appendChild(subLink);
                });

                dropdown.appendChild(dropContent);
                navLinksContainer.appendChild(dropdown);
            } else {
                const link = document.createElement('a');
                link.href = pageFile;
                link.innerHTML = `<b>${cat.displayName.toUpperCase()}</b>`;
                navLinksContainer.appendChild(link);
            }
        });

        // Re-append wishlist icon, cart icon, and menu icon
        if (wishlistIcon) navLinksContainer.appendChild(wishlistIcon);
        if (cartIcon) navLinksContainer.appendChild(cartIcon);
        if (menuIcon) navLinksContainer.appendChild(menuIcon);

        // Also update sidebar with categories
        loadSidebarCategories(data.categories);
    } catch (err) {
        console.error("Error loading nav categories:", err);
    }
}

function loadSidebarCategories(categories) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Preserve footer links (faq, blog, sitemap, return, policy, about, contact)
    const footerLinks = [];
    sidebar.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.includes('return') || href.includes('about') || href.includes('contact') || href.includes('policy') || href.includes('faq') || href.includes('blog') || href.includes('sitemap')) {
            footerLinks.push(a.cloneNode(true));
        }
    });

    sidebar.innerHTML = '';

    // Create sidebar header with website logo and close button
const headerDiv = document.createElement('div');
headerDiv.className = 'sidebar-header';
headerDiv.innerHTML = `
    <a href="index.html" class="sidebar-brand">
        <img src="./img/profile_image.jpg" alt="Logo" class="sidebar-logo">
        <span>আভরণী</span>
    </a>
    <a href="javascript:void(0)" id="close-sidebar-btn" class="close-btn">&times;</a>
`;
sidebar.appendChild(headerDiv);

    // Re-attach close button event listener
    const closeBtn = headerDiv.querySelector('#close-sidebar-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    }

    const iconMap = {
        'women': 'fas fa-female',
        'womendress': 'fas fa-female',
        'ornament': 'fas fa-gem',
        'kids': 'fas fa-child',
        'kidszone': 'fas fa-child'
    };

    categories.forEach(cat => {
        const pageFile = getCategoryPageUrl(cat.slug, cat.name);
        const iconClass = iconMap[cat.slug] || iconMap[cat.name] || 'fas fa-tag';

        const link = document.createElement('a');
        link.href = pageFile;
        link.innerHTML = `<i class="${iconClass}"></i> ${cat.displayName}`;
        sidebar.appendChild(link);
    });

    // Add divider
    const hr = document.createElement('hr');
    hr.style.cssText = 'border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 10px 0;';
    sidebar.appendChild(hr);

    // If footer links were empty or missing FAQ/Blog/Sitemap, construct complete default quick links
    if (footerLinks.length === 0) {
        const createSidebarLink = (href, iconClass, text) => {
            const a = document.createElement('a');
            a.href = href;
            a.innerHTML = `<i class="${iconClass}"></i> ${text}`;
            return a;
        };
        footerLinks.push(createSidebarLink('track-order.html', 'fas fa-truck', 'Track Order'));
        footerLinks.push(createSidebarLink('faq.html', 'fas fa-question-circle', 'FAQ'));
        footerLinks.push(createSidebarLink('blog.html', 'fas fa-newspaper', 'Blog'));
        footerLinks.push(createSidebarLink('sitemap.html', 'fas fa-sitemap', 'Sitemap'));
        footerLinks.push(createSidebarLink('return-product.html', 'fas fa-undo', 'Return Product'));
        footerLinks.push(createSidebarLink('return-policy.html', 'fas fa-file-contract', 'Return Policy'));
        footerLinks.push(createSidebarLink('about.html', 'fas fa-info-circle', 'About Us'));
        footerLinks.push(createSidebarLink('contact.html', 'fas fa-envelope', 'Contact'));
    }

    // Re-add footer links
    footerLinks.forEach(link => sidebar.appendChild(link));

    // Attach closeSidebar to all navigation links in sidebar
    sidebar.querySelectorAll('a').forEach(a => {
        if (!a.classList.contains('close-btn') && !a.id.includes('close-sidebar-btn')) {
            a.addEventListener('click', () => {
                closeSidebar();
            });
        }
    });
}

// Payment Checkout Logic
const paymentForm = document.getElementById('checkout-form');
if (paymentForm) {
    if (cart.length === 0) {
        alert("Your cart is empty. Please select products first.");
        window.location.href = "index.html";
    }

    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        if (cart.length === 0) {
            alert("Your cart is empty. Please select products first.");
            window.location.href = "index.html";
            return;
        }
        
        const submitBtn = document.getElementById('submit-btn');
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (!selectedMethod) {
            alert("Please select a payment method.");
            return;
        }

        const trxIdInput = document.getElementById('trx-id') ? document.getElementById('trx-id').value : '';

        submitBtn.disabled = true;
        submitBtn.innerText = 'Processing Order...';

        let subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        // Shipping fee is based on selected delivery location, not payment method
        const deliveryRadio = document.querySelector('input[name="deliveryLocation"]:checked');
        let shippingFee = 0;
        if (deliveryRadio) {
            shippingFee = deliveryRadio.value === 'inside' ? 80 : 150;
        }
        // Apply promo discount if any
        let discount = 0;
        if (window.appliedPromoCode && window.appliedPromoType && window.appliedPromoValue) {
            if (window.appliedPromoType === 'percentage') {
                discount = subtotal * (window.appliedPromoValue / 100);
            } else if (window.appliedPromoType === 'fixed') {
                discount = window.appliedPromoValue;
            }
            if (discount > subtotal + shippingFee) {
                discount = subtotal + shippingFee;
            }
        }
        const finalAmount = subtotal + shippingFee - discount;

        // 🌟 FIXED: Variable names now match EXACTLY what server.js expects!
        const customerData = {
            name: document.getElementById('name') ? document.getElementById('name').value : 'Unknown',
            email: document.getElementById('email') ? document.getElementById('email').value : 'no-email@test.com',
            phone: document.getElementById('phone') ? document.getElementById('phone').value : 'N/A',
            address: document.getElementById('address') ? document.getElementById('address').value : 'N/A',
            paymentMethod: selectedMethod,
            trxId: selectedMethod === 'bkash' ? trxIdInput : 'Cash On Delivery', 
            cartItems: cart, 
            totalAmount: finalAmount,
            discountAmount: discount,
            promoCode: window.appliedPromoCode || '',
            shippingFee: shippingFee
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                document.getElementById('checkout-form').style.display = 'none'; 
                
                const successDiv = document.getElementById('success-message');
                if (successDiv) {
                    successDiv.style.display = 'block'; 
                    successDiv.innerHTML = `
                        <h2><i class="fas fa-check-circle"></i> Order Placed Successfully!</h2>
                        <p style="margin: 15px 0; color: #333;">Thank you for your purchase. We will process your order soon.</p>
                        <p>Your order number is: <strong>${data.orderNumber || 'N/A'}</strong></p>
                        <br>
                        <button onclick="downloadInvoice('${data.orderNumber}')" class="btn" style="padding: 10px 20px; background-color: #111111; color: white; border-radius: 4px; margin-right: 10px; cursor: pointer;"><i class="fas fa-file-download"></i> Download Invoice</button>
                        <a href="index.html" class="btn" style="text-decoration: none; padding: 10px 20px; background-color: #28a745; color: white; border-radius: 4px;">Return to Home</a>
                    `;
                }
                
                localStorage.removeItem(cartKey);
                cart = [];
                renderCart(); 
            } else {
                alert(data.message || "There was an error saving your order. Please try again.");
                submitBtn.disabled = false;
                submitBtn.innerText = 'Confirm & Place Order';
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Could not connect to the server. Is your backend running?");
            submitBtn.disabled = false;
            submitBtn.innerText = 'Confirm & Place Order';
        }
    });
}

// ==========================================
// UI / LAYOUT LOGIC
// ==========================================

function getOrCreateSidebarOverlay() {
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Clicking on backdrop closes the sidebar
        overlay.addEventListener('click', () => {
            closeSidebar();
        });

        // Disable touchmove on backdrop to block background touch scrolling
        overlay.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    return overlay;
}

function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    sidebar.style.right = "0px";
    sidebar.classList.add("active");

    const overlay = getOrCreateSidebarOverlay();
    overlay.classList.add("active");

    document.body.classList.add("no-scroll");
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    sidebar.style.right = "-280px";
    sidebar.classList.remove("active");

    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.classList.remove("no-scroll");
    document.body.style.overflow = "";
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    if (sidebar.style.right === "0px" || sidebar.classList.contains("active")) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Function to load and display homepage banners as carousels
async function loadHomepageSliders() {
    const container = document.getElementById('slider-container');
    if (!container) return;

    try {
        const response = await fetch('/api/banner-cards');
        const data = await response.json();

        container.innerHTML = '';

        if (!data.cards || data.cards.length === 0) {
            container.innerHTML = '<p>No sliders available at the moment.</p>';
            return;
        }

        data.cards.forEach(card => {
            // Build the slides HTML for THIS specific card
            let slidesHtml = '';
            card.images.forEach(imgUrl => {
                slidesHtml += `
                    <div class="slide">
                        <img src="${imgUrl}" alt="Card Image">
                    </div>
                `;
            });

            // Output the proper HTML structure that matches your CSS and animation logic
            container.innerHTML += `
                <div class="slider-card-wrapper">
                    ${card.heading ? `<h2 class="slider-card-heading">${escapeHTML(card.heading)}</h2>` : ''}
                    
                    <div class="hero-slider">
                        <div class="slides">
                            ${slidesHtml}
                        </div>
                    </div>
                    
                </div>
            `;
        });

        // IMPORTANT FIX: Start animations AFTER the sliders are fully loaded into the page!
        startSliderAnimations();

    } catch (error) {
        console.error("Error loading homepage sliders:", error);
        container.innerHTML = '<p style="color:red;">Failed to load sliders.</p>';
    }
}

function startSliderAnimations() {
    const sliders = document.querySelectorAll('.hero-slider');
    
    sliders.forEach(slider => {
        const slidesContainer = slider.querySelector('.slides');
        const slides = slider.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        slides.forEach(s => s.style.minWidth = "100%");

        if (totalSlides <= 1) return; 

        let currentSlide = 0;
        
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 3500); 
    });
}

// ==========================================
// FOOTER & QUICK CONTACT FLOATING WIDGETS
// ==========================================
function initFooterAndWidgets() {
    // 1. Create and append floating contact buttons if not already present
    if (!document.getElementById('floating-contact-widgets')) {
        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'floating-contact-widgets';
        floatingContainer.className = 'floating-contact-container';
        floatingContainer.innerHTML = `
            <a href="https://wa.me/8801743648510" target="_blank" class="floating-btn floating-whatsapp" title="WhatsApp Us">
                <i class="fab fa-whatsapp"></i>
            </a>
            <a href="tel:+8801743648510" class="floating-btn floating-phone" title="Call Us">
                <i class="fas fa-phone-alt"></i>
            </a>
        `;
        document.body.appendChild(floatingContainer);
    }

    // 2. Create and append the dynamic footer if not already present
    if (!document.querySelector('.site-footer')) {
        const footer = document.createElement('footer');
        footer.className = 'site-footer';
        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-section">
                    <h3>আভরণী</h3>
                    <p>Your premium boutique store for high-quality ladies' dresses, hand-crafted jewelry, ornaments, and kids wear.</p>
                    <p><i class="fas fa-map-marker-alt" style="color: #ffb6d8; margin-right: 8px;"></i> Dhaka, Bangladesh</p>
                </div>
                <div class="footer-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><a href="women.html">Women Dress</a></li>
                        <li><a href="ornament.html">Ornament</a></li>
                        <li><a href="kids.html">Kids Zone</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="faq.html">FAQ</a></li>
                        <li><a href="blog.html">Blog</a></li>
                        <li><a href="sitemap.html">Sitemap</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                        <li><a href="return-policy.html">Return Policy</a></li>
                        <li><a href="return-product.html">Return Product</a></li>
                    </ul>
                </div>
<div class="footer-section">
    <h3>Contact Us</h3>
    <p><i class="fas fa-phone" style="color: #ffb6d8; margin-right: 8px;"></i> 01628628300</p>
    <p><i class="fab fa-whatsapp" style="color: #ffb6d8; margin-right: 8px;"></i> 01628628300</p>
    <div class="social-icons">
        <!-- WhatsApp (Official Green) -->
        <a href="https://wa.me/8801743648510" style="text-decoration: none;" target="_blank">
            <i class="fab fa-whatsapp" style="color: #25D366;"></i>
        </a>
        
        <!-- Phone (Standard Green) -->
        <a href="tel:+8801743648510" style="text-decoration: none;">
            <i class="fas fa-phone-alt" style="color: #28a745;"></i>
        </a>
        
        <!-- Facebook (Official Blue) -->
        <a href="https://www.facebook.com/profile.php?id=61572879166588" style="text-decoration: none;" target="_blank">
            <i class="fab fa-facebook-f" style="color: #1877F2;"></i>
        </a>
    </div>
</div>
                </div>
            </div>
            <div class="footer-bottom">
    <p>&copy; 2026 আভরণী. All Rights Reserved.</p>
    <p>
        <a href="https://port-v-eno-m.vercel.app/" target="_blank" style="color: white; text-decoration: underline">
            DEVELOPED BY SM FERDOUS AHMMED
        </a>
    </p>
</div>
        `;
        document.body.appendChild(footer);
    }
}

// ==========================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load dynamic category navigation from database
    loadNavCategories();

    // Initialize Footer and floating widgets dynamically on all pages
    initFooterAndWidgets();

    // Update Wishlist badge counter across all pages
    updateWishlistBadge();

    // Render Wishlist items if currently on wishlist.html
    renderWishlistPage();

    // Load navbar promotional slider
    loadNavbarSliders();

    // Only load the sliders here. The animation will start automatically when they finish loading.
    loadHomepageSliders(); 

    // Load new arrivals on homepage
    loadNewArrivals();

    // Load published customer reviews slider on homepage
    loadPublishedReviewsSlider();

    // Initialize search functionality
    initSearch();

    // Initialize search bar filter functionality
    initGlobalFilter();

    // If on cart page, prevent checkout if cart is empty
    const confirmOrderBtn = document.querySelector('a[href="payment.html"]');
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', (e) => {
            if (cart.length === 0) {
                e.preventDefault();
                alert("Your cart is empty. Please select products first.");
            }
        });
    }

    // Securely attach sidebar toggle events
    const menuIcon = document.getElementById('menu-icon-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    if (menuIcon) menuIcon.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSidebar();
    });

    // Securely listen to Payment Method radio buttons changing
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentDetails);
    });

    // Modal close button
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProductModal);
    }

    // Close modal on overlay click
    const modalOverlay = document.getElementById('product-detail-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeProductModal();
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProductModal();
    });

    // Secure Global Event Delegation for dynamically created buttons
    document.body.addEventListener('click', (e) => {
        
        // 1. Add to Cart Button Logic (Using closest to catch icon/span clicks; ignore modal's cart button)
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn && addToCartBtn.id !== 'modal-add-to-cart-btn') {
            e.stopPropagation(); // Prevent product card click from firing
            const id = addToCartBtn.getAttribute('data-id');
            const name = addToCartBtn.getAttribute('data-name');
            const price = Number(addToCartBtn.getAttribute('data-price'));
            const image = addToCartBtn.getAttribute('data-image');
            const maxStock = Number(addToCartBtn.getAttribute('data-stock'));
            
            addToCart(id, name, price, image, maxStock);
        }

        // 2. Cart Quantity Decrease (-)
        if (e.target.classList.contains('qty-decrease')) {
            const id = e.target.getAttribute('data-id');
            changeQty(id, -1);
        }

        // 3. Cart Quantity Increase (+)
        if (e.target.classList.contains('qty-increase')) {
            const id = e.target.getAttribute('data-id');
            changeQty(id, 1);
        }

        // 4. Product Card Click -> Open product detail modal (Only if NOT clicking the Add to Cart or Wishlist button)
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-card-btn')) {
            const productId = productCard.getAttribute('data-product-id');
            if (productId && productId !== 'null' && productId !== 'undefined') {
                openProductModal(productId);
            }
        }

        // 5. Related product card click
        const relatedCard = e.target.closest('.related-product-card');
        if (relatedCard) {
            const productId = relatedCard.getAttribute('data-product-id');
            if (productId && productId !== 'null' && productId !== 'undefined') {
                openProductModal(productId);
            }
        }

        // 6. Cart item remove button click
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const id = removeBtn.getAttribute('data-id');
            if (id) removeFromCart(id);
        }
    });

    // Run initial cart render as soon as the DOM is interactive
    renderCart();
});

// Robust fallback execution for page load event
if (document.readyState === 'complete') {
    renderCart();
} else {
    window.addEventListener('load', renderCart);
}

// ==========================================
// NEW ARRIVALS (Homepage - All categories)
// ==========================================
async function loadNewArrivals() {
    const grid = document.getElementById('new-arrivals-grid');
    if (!grid) return;

    // Render skeleton placeholders while fetching new arrivals
    grid.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
        <div class="skeleton-card"><div class="skeleton-loader skeleton-image"></div><div class="skeleton-loader skeleton-title"></div><div class="skeleton-loader skeleton-price"></div><div class="skeleton-loader skeleton-btn"></div></div>
    `;

    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (!data.success || !data.products || data.products.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No products available yet.</p>';
            return;
        }

        grid.innerHTML = '';
        // Show latest products (already sorted newest first by the API)
        const latestProducts = data.products.slice(0, 20);
        window.currentMasterProducts = latestProducts;

        renderFilteredProducts(latestProducts, 'all', grid);
    } catch (error) {
        console.error("Error loading new arrivals:", error);
        grid.innerHTML = '<p style="text-align:center; color:red;">Failed to load products.</p>';
    }
}

// ==========================================
// GLOBAL SEARCH & FILTER FUNCTIONALITY
// ==========================================
let searchTimeout = null;

async function populateGlobalFilterSubcategories() {
    const subGroup = document.getElementById('filter-subcategories-group');
    if (!subGroup) return;

    try {
        const subcategoriesSet = new Set();

        const response = await fetch('/api/categories');
        const data = await response.json();

        if (data.success && Array.isArray(data.categories)) {
            data.categories.forEach(cat => {
                if (Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach(sub => {
                        if (sub && sub.trim()) subcategoriesSet.add(sub.trim());
                    });
                }
            });
        }

        // Also check products for custom subcategories
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.products)) {
            prodData.products.forEach(p => {
                if (p.subcategory && p.subcategory.trim()) {
                    subcategoriesSet.add(p.subcategory.trim());
                }
            });
        }

        subGroup.innerHTML = '';
        subcategoriesSet.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = `sub:${sub.toLowerCase()}`;
            opt.textContent = sub;
            subGroup.appendChild(opt);
        });
    } catch (err) {
        console.error("Error populating filter subcategories:", err);
    }
}

function initGlobalFilter() {
    const filterSelect = document.getElementById('global-filter-select');
    if (!filterSelect) return;

    populateGlobalFilterSubcategories();

    filterSelect.addEventListener('change', () => {
        applyGlobalFilterAndSort();
    });
}

function applyGlobalFilterAndSort() {
    const filterSelect = document.getElementById('global-filter-select');
    if (!filterSelect) return;

    const searchInput = document.getElementById('global-search-input');
    const query = searchInput ? searchInput.value.trim() : '';

    if (query.length >= 2) {
        performSearch(query);
        return;
    }

    const productContainer = document.getElementById('product-list') || 
                             document.getElementById('products-container') || 
                             document.getElementById('new-arrivals-grid');

    if (window.currentMasterProducts && Array.isArray(window.currentMasterProducts) && productContainer) {
        // Re-render product container respecting the global filter select
        const activeSubBtn = document.querySelector('#subcategory-filters .filter-btn.active');
        const currentSub = activeSubBtn ? activeSubBtn.getAttribute('data-sub') : 'all';
        renderFilteredProducts(window.currentMasterProducts, currentSub, productContainer);
    }
}

function initSearch() {
    const searchInput = document.getElementById('global-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const dropdown = document.getElementById('search-results-dropdown');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        if (clearBtn) clearBtn.style.display = query.length > 0 ? 'block' : 'none';

        // Debounce search
        if (searchTimeout) clearTimeout(searchTimeout);

        if (query.length < 2) {
            if (dropdown) dropdown.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            if (dropdown) dropdown.classList.remove('active');
            searchInput.focus();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (dropdown && !e.target.closest('.search-bar-container')) {
            dropdown.classList.remove('active');
        }
    });
}

async function performSearch(query) {
    const dropdown = document.getElementById('search-results-dropdown');
    const filterSelect = document.getElementById('global-filter-select');
    const filterVal = filterSelect ? filterSelect.value : 'all';

    if (!dropdown) return;

    try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.success || !data.products || data.products.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results"><i class="fas fa-search" style="margin-right:8px;"></i>No products found for "${query}"</div>`;
            dropdown.classList.add('active');
            return;
        }

        let products = [...data.products];

        // Apply subcategory filter
        if (filterVal.startsWith('sub:')) {
            const targetSub = filterVal.replace('sub:', '').toLowerCase();
            products = products.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === targetSub);
        }

        // Apply price sorting
        if (filterVal === 'price-asc') {
            products.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (filterVal === 'price-desc') {
            products.sort((a, b) => Number(b.price) - Number(a.price));
        }

        if (products.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results"><i class="fas fa-filter" style="margin-right:8px;"></i>No products match filter for "${escapeHTML(query)}"</div>`;
            dropdown.classList.add('active');
            return;
        }

        dropdown.innerHTML = '';
        products.slice(0, 8).forEach(product => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.setAttribute('data-product-id', product._id);
            item.innerHTML = `
                <img src="${formatImageUrl(product.imageUrl)}" alt="${escapeHTML(product.name)}" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
                <div class="search-result-info">
                    <h4>${escapeHTML(product.name)}</h4>
                    <span>${escapeHTML(product.category)}${product.subcategory ? ' • ' + escapeHTML(product.subcategory) : ''}</span>
                </div>
                <span class="search-result-price">৳${escapeHTML(product.price)}</span>
            `;
            item.addEventListener('click', () => {
                openProductModal(product._id);
                dropdown.classList.remove('active');
                document.getElementById('global-search-input').value = '';
                document.getElementById('search-clear-btn').style.display = 'none';
            });
            dropdown.appendChild(item);
        });

        if (products.length > 8) {
            dropdown.innerHTML += `<div class="search-no-results" style="color: #111111; font-weight:600;">+ ${products.length - 8} more results</div>`;
        }

        dropdown.classList.add('active');
    } catch (error) {
        console.error("Search error:", error);
    }
}

// ==========================================
// PRODUCT DETAIL MODAL + RELATED PRODUCTS
// ==========================================
async function openProductModal(productId) {
    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    // Show modal with loading state
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Show skeleton placeholders for related products immediately
    const relatedGrid = document.getElementById('related-products-grid');
    if (relatedGrid) {
        relatedGrid.innerHTML = `
            <div class="skeleton-card" style="height: 180px; gap: 8px; padding: 10px;"><div class="skeleton-loader skeleton-image" style="height: 100px; margin-bottom:5px;"></div><div class="skeleton-loader skeleton-title" style="height: 12px; margin: 4px auto;"></div><div class="skeleton-loader skeleton-price" style="height: 10px; width: 60%; margin: 4px auto;"></div></div>
            <div class="skeleton-card" style="height: 180px; gap: 8px; padding: 10px;"><div class="skeleton-loader skeleton-image" style="height: 100px; margin-bottom:5px;"></div><div class="skeleton-loader skeleton-title" style="height: 12px; margin: 4px auto;"></div><div class="skeleton-loader skeleton-price" style="height: 10px; width: 60%; margin: 4px auto;"></div></div>
            <div class="skeleton-card" style="height: 180px; gap: 8px; padding: 10px;"><div class="skeleton-loader skeleton-image" style="height: 100px; margin-bottom:5px;"></div><div class="skeleton-loader skeleton-title" style="height: 12px; margin: 4px auto;"></div><div class="skeleton-loader skeleton-price" style="height: 10px; width: 60%; margin: 4px auto;"></div></div>
            <div class="skeleton-card" style="height: 180px; gap: 8px; padding: 10px;"><div class="skeleton-loader skeleton-image" style="height: 100px; margin-bottom:5px;"></div><div class="skeleton-loader skeleton-title" style="height: 12px; margin: 4px auto;"></div><div class="skeleton-loader skeleton-price" style="height: 10px; width: 60%; margin: 4px auto;"></div></div>
        `;
    }

    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (!data.success || !data.product) {
            alert("Product not found.");
            closeProductModal();
            return;
        }

        const product = data.product;

        // Fill modal content
        const modalImg = document.getElementById('modal-product-image');
        modalImg.src = formatImageUrl(product.imageUrl);
        modalImg.onerror = function() { this.onerror=null; this.src='./img/profile_image.jpg'; };
        modalImg.alt = product.name;
        // Reset zoom state for re-use and attach interactive zoom
        modalImg.removeAttribute('data-zoom-initialized');
        modalImg.style.transform = 'scale(1)';
        modalImg.style.transformOrigin = 'center center';
        initInteractiveZoom(modalImg);

        document.getElementById('modal-product-name').innerText = product.name;
        document.getElementById('modal-product-price').innerText = `৳${product.price}`;
        
        const categoryLabel = product.category + (product.subcategory ? ' / ' + product.subcategory : '');
        document.getElementById('modal-product-category').innerText = categoryLabel;

        const stockEl = document.getElementById('modal-product-stock');
        if (product.stockQuantity > 0) {
            stockEl.innerHTML = `<span style="color:green;">✓ In Stock (${product.stockQuantity} available)</span>`;
        } else {
            stockEl.innerHTML = `<span style="color:red;">✗ Out of Stock</span>`;
        }

        // Render Size, Colour, and Brand details in modal
        const detailsEl = document.getElementById('modal-product-details');
        if (detailsEl) {
            let detailsHtml = '';
            if (product.brand) detailsHtml += `<p style="margin: 5px 0;"><strong>Brand:</strong> ${escapeHTML(product.brand)}</p>`;
            if (product.size) detailsHtml += `<p style="margin: 5px 0;"><strong>Size:</strong> ${escapeHTML(product.size)}</p>`;
            if (product.colour) detailsHtml += `<p style="margin: 5px 0;"><strong>Colour:</strong> ${escapeHTML(product.colour)}</p>`;
            
            if (detailsHtml) {
                detailsEl.style.display = 'block';
                detailsEl.innerHTML = detailsHtml;
            } else {
                detailsEl.style.display = 'none';
                detailsEl.innerHTML = '';
            }
        }

        // Setup Add to Cart button
        const cartBtn = document.getElementById('modal-add-to-cart-btn');
        if (product.stockQuantity > 0) {
            cartBtn.disabled = false;
            cartBtn.style.background = '';
            cartBtn.onclick = () => {
                addToCart(product._id, product.name, product.price, formatImageUrl(product.imageUrl), product.stockQuantity);
            };
        } else {
            cartBtn.disabled = true;
            cartBtn.style.background = 'grey';
            cartBtn.onclick = null;
        }

        // Attach Star Rating & Review input section inside product detail modal
        ensureModalReviewSection(modal, product);

        // Fill related products
        const relatedGrid = document.getElementById('related-products-grid');
        if (relatedGrid) {
            if (data.relatedProducts && data.relatedProducts.length > 0) {
                relatedGrid.innerHTML = '';
                data.relatedProducts.forEach(rp => {
                    relatedGrid.innerHTML += `
                        <div class="related-product-card" data-product-id="${rp._id}">
                            <img src="${formatImageUrl(rp.imageUrl)}" alt="${rp.name}" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
                            <h4>${rp.name}</h4>
                            <span class="related-price">৳${rp.price}</span>
                        </div>
                    `;
                });
            } else {
                relatedGrid.innerHTML = '<p style="color:#888; text-align:center; width:100%; font-size:13px;">No related products found.</p>';
            }
        }

    } catch (error) {
        console.error("Error loading product details:", error);
        alert("Failed to load product details.");
        closeProductModal();
    }
}

function closeProductModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ==========================================
// NAVBAR PROMOTIONAL PHOTO SLIDER
// ==========================================
async function loadNavbarSliders() {
    const container = document.getElementById('nav-promo-slider');
    if (!container) return;

    try {
        const response = await fetch('/api/nav-sliders');
        const data = await response.json();

        if (!data.success || !data.sliders || data.sliders.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = '';
        data.sliders.forEach((slider, idx) => {
            const img = document.createElement('img');
            img.src = formatImageUrl(slider.imageUrl);
            img.onerror = function() { this.onerror=null; this.src='./img/profile_image.jpg'; };
            img.alt = `Offer ${idx + 1}`;
            if (idx === 0) img.classList.add('active');
            
            if (slider.link) {
                const linkWrap = document.createElement('a');
                linkWrap.href = slider.link;
                linkWrap.style.display = 'contents';
                linkWrap.appendChild(img);
                container.appendChild(linkWrap);
            } else {
                container.appendChild(img);
            }
        });

        if (data.sliders.length > 1) {
            let activeIdx = 0;
            const images = container.querySelectorAll('img');
            setInterval(() => {
                images[activeIdx].classList.remove('active');
                activeIdx = (activeIdx + 1) % images.length;
                images[activeIdx].classList.add('active');
            }, 4000);
        }
    } catch (err) {
        console.error("Error loading navbar sliders:", err);
        container.style.display = 'none';
    }
}

// ==========================================
// WISHLIST MANAGEMENT & PAGE RENDERER
// ==========================================
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem('wishlist_items')) || [];
    } catch(e) {
        return [];
    }
}

function updateWishlistBadge() {
    const wishlist = getWishlist();
    const badge = document.getElementById('wishlist-count');
    if (badge) {
        badge.innerText = wishlist.length;
    }
}

function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.some(item => (item._id === productId || item.id === productId));
}

function toggleWishlistProduct(product) {
    let wishlist = getWishlist();
    const pId = product._id || product.id;
    const index = wishlist.findIndex(item => (item._id === pId || item.id === pId));
    
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push({
            _id: pId,
            id: pId,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10
        });
    }
    localStorage.setItem('wishlist_items', JSON.stringify(wishlist));
    updateWishlistBadge();
}

function removeWishlistItem(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => (item._id !== productId && item.id !== productId));
    localStorage.setItem('wishlist_items', JSON.stringify(wishlist));
    updateWishlistBadge();
    renderWishlistPage();
}

function renderWishlistPage() {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('wishlist-empty-state');
    if (!grid) return;

    const wishlist = getWishlist();
    grid.innerHTML = '';

    if (wishlist.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    wishlist.forEach(product => {
        const fullImageUrl = formatImageUrl(product.imageUrl);
        const pId = product._id || product.id;
        grid.innerHTML += `
            <div class="product-card" data-product-id="${pId}">
                <div class="product-image-wrap">
                    <button class="wishlist-card-btn active" data-id="${pId}" title="Remove from Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <img src="${fullImageUrl}" alt="${product.name}" class="product-image" onerror="this.onerror=null; this.src='./img/profile_image.jpg';">
                </div>
                <h3>${product.name}</h3>
                <p class="price">৳${product.price}</p>
                <div class="wishlist-card-actions">
                    <button class="btn add-to-cart-btn" 
                        data-id="${pId}" 
                        data-name="${(product.name || '').replace(/"/g, '&quot;')}" 
                        data-price="${product.price}" 
                        data-image="${fullImageUrl}">Add to Cart</button>
                    <button onclick="removeWishlistItem('${pId}')" class="btn-remove-wishlist" title="Remove from Wishlist"><i class="fas fa-trash-alt"></i> <span>Remove</span></button>
                </div>
            </div>
        `;
    });

    bindAllProductZoomEffects();
}

// Attach Event Delegation for Wishlist Card Buttons
document.addEventListener('click', (e) => {
    const wishlistBtn = e.target.closest('.wishlist-card-btn');
    if (wishlistBtn) {
        e.stopPropagation();
        e.preventDefault();
        const pId = wishlistBtn.getAttribute('data-id');
        
        let product = (window.allProducts || []).find(p => (p._id === pId || p.id === pId));
        if (!product) {
            const card = wishlistBtn.closest('.product-card');
            const nameEl = card ? card.querySelector('h3') : null;
            const priceEl = card ? card.querySelector('.price') : null;
            const imgEl = card ? card.querySelector('.product-image') : null;
            
            product = {
                _id: pId,
                id: pId,
                name: nameEl ? nameEl.innerText : 'Product',
                price: priceEl ? parseFloat(priceEl.innerText.replace(/[^\d.]/g, '')) || 0 : 0,
                imageUrl: imgEl ? imgEl.src : './img/profile_image.jpg'
            };
        }

        toggleWishlistProduct(product);

        const inWishlist = isInWishlist(pId);
        const icon = wishlistBtn.querySelector('i');
        if (inWishlist) {
            wishlistBtn.classList.add('active');
            wishlistBtn.title = "Remove from Wishlist";
            if (icon) icon.className = "fas fa-heart";
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.title = "Save to Wishlist";
            if (icon) icon.className = "far fa-heart";
        }

        if (document.getElementById('wishlist-grid')) {
            renderWishlistPage();
        }
    }
});

// ==========================================
// STAR RATING & CUSTOMER REVIEW HANDLERS
// ==========================================
function ensureModalReviewSection(modalElement, product) {
    let reviewSec = modalElement.querySelector('.product-modal-review-section');
    if (!reviewSec) {
        reviewSec = document.createElement('div');
        reviewSec.className = 'product-modal-review-section';
        reviewSec.innerHTML = `
            <div class="review-modal-header" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2b0c5;">
                <h4 style="font-size: 16px; color: #111; margin: 0 0 4px 0; display:flex; align-items:center; gap:8px;"><i class="fas fa-star" style="color:#ffc107;"></i> Rate & Review Product</h4>
                <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Share your star rating and honest opinion</p>
            </div>
            <form id="modal-review-form" onsubmit="handleModalReviewSubmit(event)">
                <input type="hidden" id="review-modal-prod-id" value="${product._id || product.id || ''}">
                <input type="hidden" id="review-modal-prod-name" value="${(product.name || '').replace(/"/g, '&quot;')}">
                <input type="hidden" id="modal-review-rating-val" value="5">

                <div class="review-form-field" style="margin-bottom: 10px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#333; margin-bottom:4px;">Star Rating:</label>
                    <div class="star-rating-selector" id="modal-star-selector" style="display:flex; gap:6px; font-size:22px; color:#ffc107; cursor:pointer;">
                        <i class="fas fa-star" data-rating="1"></i>
                        <i class="fas fa-star" data-rating="2"></i>
                        <i class="fas fa-star" data-rating="3"></i>
                        <i class="fas fa-star" data-rating="4"></i>
                        <i class="fas fa-star" data-rating="5"></i>
                    </div>
                </div>

                <div class="review-form-field" style="margin-bottom: 10px;">
                    <label for="modal-review-name" style="display:block; font-size:12px; font-weight:700; color:#333; margin-bottom:4px;">Your Name:</label>
                    <input type="text" id="modal-review-name" placeholder="Enter your full name" required class="review-input" style="width:100%; padding:9px 12px; border:1.5px solid #ffccd8; border-radius:8px; font-size:13px; outline:none; box-sizing:border-box;">
                </div>

                <div class="review-form-field" style="margin-bottom: 12px;">
                    <label for="modal-review-comment" style="display:block; font-size:12px; font-weight:700; color:#333; margin-bottom:4px;">Review Comment:</label>
                    <textarea id="modal-review-comment" placeholder="Write your review comments here..." required class="review-textarea" rows="3" style="width:100%; padding:9px 12px; border:1px solid rgba(0,0,0,0.15); border-radius:8px; font-size:13px; outline:none; box-sizing:border-box; font-family:inherit;"></textarea>
                </div>

                <button type="submit" class="btn submit-review-btn" style="background: #111111; color:#fff; border:none; padding:9px 20px; font-size:13px; font-weight:700; border-radius:25px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    <i class="fas fa-paper-plane"></i> Submit Review
                </button>
            </form>
        `;
        const modalInfo = modalElement.querySelector('.product-modal-info');
        if (modalInfo) {
            modalInfo.appendChild(reviewSec);
        } else {
            const body = modalElement.querySelector('.product-modal-body') || modalElement.querySelector('.product-modal');
            if (body) body.appendChild(reviewSec);
        }
    } else {
        const prodIdEl = document.getElementById('review-modal-prod-id');
        const prodNameEl = document.getElementById('review-modal-prod-name');
        const ratingValEl = document.getElementById('modal-review-rating-val');
        const nameEl = document.getElementById('modal-review-name');
        const commentEl = document.getElementById('modal-review-comment');

        if (prodIdEl) prodIdEl.value = product._id || product.id || '';
        if (prodNameEl) prodNameEl.value = product.name || '';
        if (ratingValEl) ratingValEl.value = '5';
        if (nameEl) nameEl.value = '';
        if (commentEl) commentEl.value = '';
    }

    initStarSelectorLogic();
}

function initStarSelectorLogic() {
    const selector = document.getElementById('modal-star-selector');
    if (!selector) return;
    const stars = selector.querySelectorAll('i');
    const valInput = document.getElementById('modal-review-rating-val');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            valInput.value = rating;
            stars.forEach((s, idx) => {
                if (idx < rating) {
                    s.className = "fas fa-star";
                } else {
                    s.className = "far fa-star";
                }
            });
        });
    });
}

async function handleModalReviewSubmit(e) {
    e.preventDefault();
    const productId = document.getElementById('review-modal-prod-id').value;
    const productName = document.getElementById('review-modal-prod-name').value;
    const rating = document.getElementById('modal-review-rating-val').value;
    const reviewerName = document.getElementById('modal-review-name').value.trim();
    const comment = document.getElementById('modal-review-comment').value.trim();

    if (!reviewerName || !comment) {
        alert("Please enter your name and comment.");
        return;
    }

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, productName, reviewerName, rating, comment })
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message || "Thank you! Your review has been submitted for admin approval.");
            document.getElementById('modal-review-name').value = '';
            document.getElementById('modal-review-comment').value = '';
        } else {
            alert(data.message || "Failed to submit review.");
        }
    } catch (err) {
        console.error("Error submitting review:", err);
        alert("Failed to submit review.");
    }
}

let reviewsTimer = null;
let currentReviewIndex = 0;

async function loadPublishedReviewsSlider() {
    // Check if current page is in the excluded list
    const rawPath = window.location.pathname.toLowerCase();
    const currentPage = rawPath.substring(rawPath.lastIndexOf('/') + 1) || 'index.html';

    const excludedPages = [
        'faq.html',
        'sitemap.html',
        'blog.html',
        'return-policy.html',
        'return-product.html',
        'contact.html',
        'about.html',
        'admin.html',
        'admin-login.html',
        'payment.html',
        'register.html',
        'forgot-password.html',
        'reset-password.html'
    ];

    const isExcluded = excludedPages.some(page => currentPage.includes(page));

    let section = document.getElementById('reviews-slider-section');

    if (isExcluded) {
        if (section) section.style.display = 'none';
        return;
    }

    // Create section dynamically if it doesn't exist on allowed pages
    if (!section) {
        section = document.createElement('section');
        section.className = 'reviews-slider-section';
        section.id = 'reviews-slider-section';
        section.style.display = 'none';
        section.innerHTML = `
            <div class="reviews-slider-container">
                <h2 class="section-title"><i class="fas fa-star" style="color:#ffc107;"></i> What Our Customers Say <i class="fas fa-star" style="color:#ffc107;"></i></h2>
                <p class="section-subtitle">Real reviews from our valued shoppers</p>
                <div class="reviews-slider-wrapper">
                    <div class="reviews-slides" id="reviews-slides-container"></div>
                </div>
            </div>
        `;
    }

    // Position section right before .site-footer at the bottom of the page
    const footer = document.querySelector('.site-footer');
    if (footer) {
        document.body.insertBefore(section, footer);
    } else {
        document.body.appendChild(section);
    }

    const container = document.getElementById('reviews-slides-container');
    if (!container) return;

    try {
        const response = await fetch('/api/reviews/published');
        const data = await response.json();

        if (!data.success || !data.reviews || data.reviews.length === 0) {
            section.style.display = 'none';
            return;
        }

        container.innerHTML = '';
        data.reviews.forEach(rev => {
            const stars = '⭐'.repeat(rev.rating || 5);
            container.innerHTML += `
                <div class="review-slide-card">
                    <div class="review-stars">${stars}</div>
                    <p class="review-comment">"${escapeHTML(rev.comment)}"</p>
                    <div class="review-author">
                        <strong>${escapeHTML(rev.reviewerName)}</strong>
                        <span class="review-product-tag"><i class="fas fa-shopping-bag"></i> ${escapeHTML(rev.productName || 'Verified Buyer')}</span>
                    </div>
                </div>
            `;
        });

        section.style.display = 'block';

        const totalSlides = data.reviews.length;
        if (totalSlides > 1) {
            currentReviewIndex = 0;

            if (reviewsTimer) clearInterval(reviewsTimer);

            const nextReviewSlide = () => {
                currentReviewIndex = (currentReviewIndex + 1) % totalSlides;
                container.style.transform = `translateX(-${currentReviewIndex * 100}%)`;
            };

            const startCarousel = () => {
                if (!reviewsTimer) {
                    reviewsTimer = setInterval(nextReviewSlide, 3500);
                }
            };

            const stopCarousel = () => {
                if (reviewsTimer) {
                    clearInterval(reviewsTimer);
                    reviewsTimer = null;
                }
            };

            startCarousel();

            // Hover events: Pause carousel on mouse enter, resume on mouse leave
            section.onmouseenter = stopCarousel;
            section.onmouseleave = startCarousel;
        }

    } catch (err) {
        console.error("Error loading published reviews slider:", err);
        section.style.display = 'none';
    }
}

// =============================================
// ⚡ FLASH SALE STICKY COUNTDOWN BANNER
// =============================================

(function initFlashSaleBanner() {
    let tickInterval = null;

    function adjustBannerSpacing(banner) {
        const h = banner.offsetHeight;
        document.body.style.paddingTop = h + 'px';
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.style.top = h + 'px';
    }

    async function loadFlashSaleBanner() {
        if (window.location.pathname.includes('admin')) return;

        try {
            const res = await fetch('/api/flash-sale');
            const data = await res.json();
            if (!data.success || !data.flashSale) return;

            const fs = data.flashSale;
            if (!fs.isActive) return;

            const endTime = new Date(fs.endTime).getTime();
            if (endTime <= Date.now()) return;

            const banner = document.createElement('div');
            banner.id = 'flash-sale-banner';
            banner.innerHTML = `
                <div class="flash-left">
                    <span class="flash-icon">⚡</span>
                    <span class="flash-title">${escapeHTML(fs.title)}</span>
                    <div class="flash-timer" id="fs-timer">
                        <div style="display:flex;flex-direction:column;align-items:center">
                            <span class="timer-chip" id="fs-hours">00</span>
                            <span class="timer-label">hrs</span>
                        </div>
                        <span class="colon">:</span>
                        <div style="display:flex;flex-direction:column;align-items:center">
                            <span class="timer-chip" id="fs-mins">00</span>
                            <span class="timer-label">min</span>
                        </div>
                        <span class="colon">:</span>
                        <div style="display:flex;flex-direction:column;align-items:center">
                            <span class="timer-chip" id="fs-secs">00</span>
                            <span class="timer-label">sec</span>
                        </div>
                    </div>
                    ${fs.subtitle ? `<span class="flash-subtitle">— ${escapeHTML(fs.subtitle)}</span>` : ''}
                </div>
                <div class="flash-right">
                    <a href="${escapeHTML(fs.buttonLink || '#')}" class="flash-shop-btn">
                        ${escapeHTML(fs.buttonText || 'Shop Now')} <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;

            document.body.prepend(banner);
            document.body.classList.add('has-flash-banner');

            // Dynamically measure banner height and push content down
            requestAnimationFrame(() => adjustBannerSpacing(banner));
            window.addEventListener('resize', () => adjustBannerSpacing(banner));

            // Tick countdown
            function tick() {
                const diff = new Date(fs.endTime).getTime() - Date.now();
                if (diff <= 0) {
                    document.getElementById('fs-hours').textContent = '00';
                    document.getElementById('fs-mins').textContent  = '00';
                    document.getElementById('fs-secs').textContent  = '00';
                    banner.classList.add('expired');
                    clearInterval(tickInterval);
                    setTimeout(() => {
                        banner.remove();
                        document.body.classList.remove('has-flash-banner');
                        document.body.style.paddingTop = '';
                        const navbar = document.querySelector('.navbar');
                        if (navbar) navbar.style.top = '';
                    }, 3000);
                    return;
                }
                const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
                const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
                const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
                document.getElementById('fs-hours').textContent = h;
                document.getElementById('fs-mins').textContent  = m;
                document.getElementById('fs-secs').textContent  = s;
            }

            tick();
            tickInterval = setInterval(tick, 1000);

        } catch (err) {
            console.warn('Flash sale banner: could not load config.', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFlashSaleBanner);
    } else {
        loadFlashSaleBanner();
    }
})();