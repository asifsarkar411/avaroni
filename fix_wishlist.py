import re

html_to_inject = """
    <!-- Product Detail Modal -->
    <div id="product-detail-modal" class="product-modal-overlay" style="display:none;">
        <div class="product-modal">
            <button class="product-modal-close" id="modal-close-btn"><i class="fas fa-times"></i></button>
            <div class="product-modal-body">
                <div class="product-modal-image">
                    <img id="modal-product-image" src="" alt="">
                </div>
                <div class="product-modal-info">
                    <span class="product-modal-category" id="modal-product-category"></span>
                    <h2 id="modal-product-name"></h2>
                    <p class="product-modal-price" id="modal-product-price"></p>
                    <p class="product-modal-stock" id="modal-product-stock"></p>
                    <div id="modal-product-details" style="margin: 15px 0; font-size: 14px; line-height: 1.6; color: #555; border-top: 1px dotted #ddd; border-bottom: 1px dotted #ddd; padding: 10px 0; display: none;"></div>
                    <button class="btn add-to-cart-btn product-modal-cart-btn" id="modal-add-to-cart-btn">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
            <div class="related-products-section">
                <h3><i class="fas fa-th-large"></i> Related Products</h3>
                <div class="related-products-grid" id="related-products-grid">

                </div>
            </div>
        </div>
    </div>
"""

def patch_wishlist(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        return

    if 'id="product-detail-modal"' not in content:
        content = content.replace('<script src="script.js"></script>', html_to_inject + '\n    <script src="script.js"></script>')
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

def patch_script(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        return
        
    old_str = "if (productCard && !e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-card-btn')) {"
    new_str = "if (productCard && !e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-card-btn') && !e.target.closest('.btn-remove-wishlist')) {"
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

patch_wishlist(r"d:\ecomerce website\client\public\wishlist.html")
patch_wishlist(r"d:\ecomerce website\public\wishlist.html")

patch_script(r"d:\ecomerce website\client\public\script.js")
patch_script(r"d:\ecomerce website\public\script.js")
