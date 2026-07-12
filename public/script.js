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
            <div class="product-card">
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

let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
    
    localStorage.setItem('cart', JSON.stringify(cart));
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
    
    if (!cartContainer && !totalElement) return; 

    if (cartContainer) cartContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        if (cartContainer) cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        if (totalElement) totalElement.innerText = '0';
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
    
    let shippingFee = 0;
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    if (paymentRadios.length > 0) {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        if (selectedMethod === 'cod') {
            shippingFee = 150; 
        }
    }

    if (totalElement) {
        totalElement.innerText = (subtotal + shippingFee).toFixed(2).replace(/\.00$/, ''); 
    }
    
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
        localStorage.setItem('cart', JSON.stringify(cart));
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
        let shippingFee = selectedMethod === 'cod' ? 150 : 0;

        // 🌟 FIXED: Variable names now match EXACTLY what server.js expects!
        const customerData = {
            name: document.getElementById('name') ? document.getElementById('name').value : 'Unknown',
            email: document.getElementById('email') ? document.getElementById('email').value : 'no-email@test.com',
            phone: document.getElementById('phone') ? document.getElementById('phone').value : 'N/A',
            address: document.getElementById('address') ? document.getElementById('address').value : 'N/A',
            paymentMethod: selectedMethod,
            trxId: selectedMethod === 'bkash' ? trxIdInput : 'Cash On Delivery', 
            cartItems: cart, 
            totalAmount: subtotal + shippingFee
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
                
                localStorage.removeItem('cart');
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
// INITIALIZATION & EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load dynamic category navigation from database
    loadNavCategories();

    // Only load the sliders here. The animation will start automatically when they finish loading.
    loadHomepageSliders(); 

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

    // Secure Global Event Delegation for dynamically created buttons
    document.body.addEventListener('click', (e) => {
        
        // 1. Add to Cart Button Logic
        if (e.target.classList.contains('add-to-cart-btn')) {
            const btn = e.target;
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = Number(btn.getAttribute('data-price'));
            const image = btn.getAttribute('data-image');
            const maxStock = Number(btn.getAttribute('data-stock'));
            
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
    });
});

window.addEventListener('load', renderCart);