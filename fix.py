import re

def modify_css(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return
        
    content = re.sub(r'(\.category-header\s*\{[^}]*?text-align:\s*)left', r'\g<1>center', content)
    content = re.sub(r'(\.category-grid\s*\{[^}]*?justify-content:\s*)start', r'\g<1>center', content)
    
    mobile_css = """
/* Added Mobile Responsive Rules */
@media (max-width: 480px) {
    .product-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
        padding: 8px !important;
    }
    .product-card { padding: 6px !important; }
    .product-card h3 {
        font-size: 11px !important;
        height: 28px !important;
        margin-bottom: 4px !important;
    }
    .product-card .price {
        font-size: 12px !important;
        margin-bottom: 4px !important;
    }
    .product-card .btn {
        padding: 5px !important;
        font-size: 10px !important;
    }
    .product-modal-body {
        padding: 10px !important;
        gap: 10px !important;
        flex-direction: column !important;
    }
    .product-modal-info h2 {
        font-size: 16px !important;
    }
    .product-modal-price {
        font-size: 18px !important;
    }
    .product-modal-cart-btn {
        padding: 8px 16px !important;
        font-size: 14px !important;
        width: 100% !important;
        justify-content: center !important;
    }
}
"""
    if "Added Mobile Responsive Rules" not in content:
        content += mobile_css
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

modify_css(r'd:\ecomerce website\client\public\style.css')
modify_css(r'd:\ecomerce website\client\src\app\globals.css')
modify_css(r'd:\ecomerce website\public\style.css')
