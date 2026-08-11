import os

css = """
/* Product Modal Tabs */
.product-modal-tabs-container {
    display: flex;
    gap: 30px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}
.product-modal-tabs-container::-webkit-scrollbar {
    display: none;
}
.product-modal-tab-btn {
    background: none;
    border: none;
    padding: 10px 0;
    font-weight: normal;
    color: #666;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    position: relative;
    top: 1px;
    flex-shrink: 0;
}
.product-modal-tab-btn.active {
    font-weight: bold;
    color: #111;
    border-bottom: 2px solid #111;
}
@media (max-width: 480px) {
    .product-modal-tabs-container {
        gap: 15px;
    }
    .product-modal-tab-btn {
        font-size: 12px;
        padding: 8px 0;
    }
}
"""

with open(r'd:\ecomerce website\client\src\app\globals.css', 'a', encoding='utf-8') as f:
    f.write(css)
