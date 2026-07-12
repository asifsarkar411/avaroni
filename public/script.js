// ==========================================
// PRODUCTS & CART LOGIC
// ==========================================

// Function to load products dynamically from the database
async function loadProducts(category) {
    // Looks for either ID so it works on all your pages!
    const productContainer = document.getElementById('product-list') || document.getElementById('products-container');
    
    if (!productContainer) return; 

    try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();

        if (data.success) {
            productContainer.innerHTML = ''; 
            
            if(data.products.length === 0) {
                productContainer.innerHTML = `<p style="text-align:center; width:100%;">No products found in this category yet. Check back soon!</p>`;
                return;
            }

            data.products.forEach(product => {
                const fullImageUrl = product.imageUrl;
                const stockText = product.stockQuantity > 0 ? `<p style="color:green;">In Stock: ${product.stockQuantity}</p>` : `<p style="color:red;">Out of Stock</p>`;
                const btnStatus = product.stockQuantity > 0 ? "" : "disabled style='background:grey;'";

                // Securely rendering products without onclick
                productContainer.innerHTML += `
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
    } catch (error) {
        console.error("Error loading products:", error);
        productContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load products. Is the server running?</p>`;
    }
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
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (!cartContainer && !totalElement) return; 

    if (cartContainer) cartContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        if (cartContainer) cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        if (totalElement) totalElement.innerText = '0';
        return;
    }

    cart.forEach(item => {
        let itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;
        
        if (cartContainer) {
            cartContainer.innerHTML += `
                <div class="cart-item" style="display:flex; align-items:center; margin-bottom:15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; border-radius: 4px;">
                    <span style="flex:1; margin-left:15px; font-weight: 500;">${item.name}</span>
                    <span style="color: #666;">৳${item.price}</span> 
                    <div style="margin: 0 20px; display: flex; align-items: center;">
                        <button class="qty-btn qty-decrease" data-id="${item.id}" style="padding: 2px 8px; cursor: pointer;">-</button>
                        <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-id="${item.id}" style="padding: 2px 8px; cursor: pointer;">+</button>
                    </div>
                    <strong style="color: #e60050;">৳${itemTotal}</strong> 
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
    }
}

// Payment Checkout Logic
const paymentForm = document.getElementById('checkout-form');
if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
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
                    // Optional: Show the order number to the customer
                    successDiv.innerHTML = `<h2>Order Placed!</h2><p>Your order number is: <strong>${data.orderNumber}</strong></p><p>A confirmation email has been sent to you.</p>`;
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
    // Only load the sliders here. The animation will start automatically when they finish loading.
    loadHomepageSliders(); 

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