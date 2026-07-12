// ==========================================
// PRODUCTS & CART LOGIC
// ==========================================

// Function to load products dynamically from the database
async function loadProducts(category) {
    const productContainer = document.getElementById('product-list') || document.getElementById('products-container');
    if (!productContainer) return; 

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
    
    const filtered = subcategoryFilter === 'all' 
        ? products 
        : products.filter(p => p.subcategory && p.subcategory.trim().toLowerCase() === subcategoryFilter);

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; width:100%; color: #666; margin-top: 20px;">No products found in this subcategory.</p>`;
        return;
    }

    filtered.forEach(product => {
        const fullImageUrl = product.imageUrl;
        const stockText = product.stockQuantity > 0 ? `<p style="color:green;">In Stock: ${product.stockQuantity}</p>` : `<p style="color:red;">Out of Stock</p>`;
        const btnStatus = product.stockQuantity > 0 ? "" : "disabled style='background:grey;'";

        container.innerHTML += `
            <div class="product-card" data-product-id="${product._id}">
                <img src="${fullImageUrl}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
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
            alert(`${name} quantity increased!`);
        } else {
            alert(`Sorry, we only have ${stockLimit} of these in stock!`);
            return; 
        }
    } else {
        cart.push({ id, name, price, image, quantity: 1, maxStock }); 
        alert(`${name} added to cart successfully!`);
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart(); 
    updateCartBadge();
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

    cartContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        if (totalElement) totalElement.innerText = '0';
        if (subtotalElement) subtotalElement.innerText = '0';
        if (shippingElement) shippingElement.innerText = '0';
        if (discountRow) discountRow.style.display = 'none';
        updateCartBadge();
        return;
    }

    cart.forEach(item => {
        let itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;
        if (cartContainer) {
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <span>${item.name}</span>
                    <span class="cart-item-price">৳${item.price}</span>
                    <div class="cart-item-qty">
                        <button class="qty-btn qty-decrease" data-id="${item.id}" style="padding: 2px 8px; cursor: pointer;">-</button>
                        <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-id="${item.id}" style="padding: 2px 8px; cursor: pointer;">+</button>
                    </div>
                    <strong class="cart-item-total">৳${itemTotal}</strong>
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

    // Promo discount handling
    let discount = 0;
    if (window.appliedPromoCode) {
        if (window.appliedPromoCode === 'SAVE10') {
            discount = subtotal * 0.1;
        } else if (window.appliedPromoCode === 'FREEDEL') {
            discount = shippingFee;
        }
    }

    // Update UI displays
    if (subtotalElement) subtotalElement.innerText = subtotal.toFixed(2).replace(/\\.00$/, '');
    if (shippingElement) shippingElement.innerText = shippingFee.toFixed(2).replace(/\\.00$/, '');
    if (discountRow) {
        discountRow.style.display = 'flex';
        if (promoDiscountElement) promoDiscountElement.innerText = discount.toFixed(2).replace(/\.00$/, '');
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
// ==========================================
// Maps category slugs to their page files
const categoryPageMap = {
    'women': 'women.html',
    'womendress': 'women.html',
    'ornament': 'ornament.html',
    'kids': 'kids.html',
    'kidszone': 'kids.html'
};

async function loadNavCategories() {
    const navLinksContainer = document.querySelector('.nav-links');
    if (!navLinksContainer) return;

    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (!data.success || !data.categories) return;

        // Preserve the cart icon and menu icon from the nav-links
        const cartIcon = navLinksContainer.querySelector('.cart-icon');
        const menuIcon = navLinksContainer.querySelector('.menu-icon');

        // Clear existing category links (keep cart/menu)
        navLinksContainer.innerHTML = '';

        data.categories.forEach(cat => {
            const pageFile = categoryPageMap[cat.slug] || categoryPageMap[cat.name] || `${cat.slug}.html`;

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
                    subLink.href = `${pageFile}?sub=${encodeURIComponent(sub)}`;
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

        // Re-append cart icon and menu icon
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

    // Preserve close button and footer links
    const closeBtn = sidebar.querySelector('.close-btn');
    const footerLinks = [];

    // Save footer links (return, policy, about, contact)
    sidebar.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.includes('return') || href.includes('about') || href.includes('contact') || href.includes('policy')) {
            footerLinks.push(a.cloneNode(true));
        }
    });

    sidebar.innerHTML = '';
    if (closeBtn) sidebar.appendChild(closeBtn.cloneNode(true));

    // Re-attach close button event
    const newCloseBtn = sidebar.querySelector('.close-btn');
    if (newCloseBtn) {
        newCloseBtn.addEventListener('click', (e) => {
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
        const pageFile = categoryPageMap[cat.slug] || categoryPageMap[cat.name] || `${cat.slug}.html`;
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

    // Re-add footer links
    footerLinks.forEach(link => sidebar.appendChild(link));
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
        if (window.appliedPromoCode) {
            if (window.appliedPromoCode === 'SAVE10') {
                discount = subtotal * 0.1;
            } else if (window.appliedPromoCode === 'FREEDEL') {
                discount = shippingFee;
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
            totalAmount: finalAmount
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
                        <a href="index.html" class="btn" style="text-decoration: none; padding: 10px 20px; background-color: #28a745; color: white; border-radius: 4px;">Return to Home</a>
                    `;
                }
                
                localStorage.removeItem(cartKey);
                cart = [];
                renderCart(); 
            } else {
                alert("There was an error saving your order. Please try again.");
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

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    // We ONLY change the 'right' property because your CSS perfectly handles the width (280px).
    if (sidebar.style.right === "0px") {
        sidebar.style.right = "-280px"; // Slide it completely off-screen to close
    } else {
        sidebar.style.right = "0px";    // Slide it to the edge of the screen to open
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
                <div class="slider-card-wrapper" style="margin: 30px auto; max-width: 800px; padding: 0 15px;">
                    ${card.heading ? `<h2 style="color: #c93f8b; margin-bottom: 15px;">${card.heading}</h2>` : ''}
                    
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
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                        <li><a href="return-policy.html">Return Policy</a></li>
                        <li><a href="return-product.html">Return Product</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact Us</h3>
                    <p><i class="fas fa-phone" style="color: #ffb6d8; margin-right: 8px;"></i> 01743648510</p>
                    <p><i class="fab fa-whatsapp" style="color: #ffb6d8; margin-right: 8px;"></i> 01743648510</p>
                    <div class="social-icons">
                        <a href="https://wa.me/8801743648510" target="_blank"><i class="fab fa-whatsapp"></i></a>
                        <a href="tel:+8801743648510"><i class="fas fa-phone-alt"></i></a>
                        <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook-f"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 আভরণী. All Rights Reserved.</p>
                <p>Crafted for elegance & beauty</p>
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

    // Only load the sliders here. The animation will start automatically when they finish loading.
    loadHomepageSliders(); 

    // Load new arrivals on homepage
    loadNewArrivals();

    // Initialize search functionality
    initSearch();

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

        // 4. Product Card Click -> Open product detail modal (Only if NOT clicking the Add to Cart button)
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.add-to-cart-btn')) {
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
    });
});

window.addEventListener('load', renderCart);

// ==========================================
// NEW ARRIVALS (Homepage - All categories)
// ==========================================
async function loadNewArrivals() {
    const grid = document.getElementById('new-arrivals-grid');
    if (!grid) return;

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

        latestProducts.forEach(product => {
            const fullImageUrl = product.imageUrl;
            const stockText = product.stockQuantity > 0 
                ? `<p style="color:green;">In Stock: ${product.stockQuantity}</p>` 
                : `<p style="color:red;">Out of Stock</p>`;
            const btnStatus = product.stockQuantity > 0 ? "" : "disabled style='background:grey;'";

            grid.innerHTML += `
                <div class="product-card" data-product-id="${product._id}">
                    <img src="${fullImageUrl}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
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
    } catch (error) {
        console.error("Error loading new arrivals:", error);
        grid.innerHTML = '<p style="text-align:center; color:red;">Failed to load products.</p>';
    }
}

// ==========================================
// GLOBAL SEARCH FUNCTIONALITY
// ==========================================
let searchTimeout = null;

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
    if (!dropdown) return;

    try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.success || !data.products || data.products.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results"><i class="fas fa-search" style="margin-right:8px;"></i>No products found for "${query}"</div>`;
            dropdown.classList.add('active');
            return;
        }

        dropdown.innerHTML = '';
        data.products.slice(0, 8).forEach(product => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.setAttribute('data-product-id', product._id);
            item.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="search-result-info">
                    <h4>${product.name}</h4>
                    <span>${product.category}${product.subcategory ? ' • ' + product.subcategory : ''}</span>
                </div>
                <span class="search-result-price">৳${product.price}</span>
            `;
            item.addEventListener('click', () => {
                openProductModal(product._id);
                dropdown.classList.remove('active');
                document.getElementById('global-search-input').value = '';
                document.getElementById('search-clear-btn').style.display = 'none';
            });
            dropdown.appendChild(item);
        });

        if (data.products.length > 8) {
            dropdown.innerHTML += `<div class="search-no-results" style="color: #e60050; font-weight:600;">+ ${data.products.length - 8} more results</div>`;
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
        document.getElementById('modal-product-image').src = product.imageUrl;
        document.getElementById('modal-product-image').alt = product.name;
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

        // Setup Add to Cart button
        const cartBtn = document.getElementById('modal-add-to-cart-btn');
        if (product.stockQuantity > 0) {
            cartBtn.disabled = false;
            cartBtn.style.background = '';
            cartBtn.onclick = () => {
                addToCart(product._id, product.name, product.price, product.imageUrl, product.stockQuantity);
            };
        } else {
            cartBtn.disabled = true;
            cartBtn.style.background = 'grey';
            cartBtn.onclick = null;
        }

        // Fill related products
        const relatedGrid = document.getElementById('related-products-grid');
        if (relatedGrid) {
            if (data.relatedProducts && data.relatedProducts.length > 0) {
                relatedGrid.innerHTML = '';
                data.relatedProducts.forEach(rp => {
                    relatedGrid.innerHTML += `
                        <div class="related-product-card" data-product-id="${rp._id}">
                            <img src="${rp.imageUrl}" alt="${rp.name}">
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