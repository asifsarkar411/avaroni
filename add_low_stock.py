import os

html_files = [
    r'd:\ecomerce website\client\public\admin.html',
    r'd:\ecomerce website\public\admin.html'
]

js_files = [
    r'd:\ecomerce website\client\public\admin.js',
    r'd:\ecomerce website\public\admin.js'
]

new_card_html = """
                        <!-- Low Stock Products -->
                        <div class="visual-card" data-aos="fade-up">
                            <h3>Low Stock Products</h3>
                            <p class="subtitle">Individual products with stock <= 5</p>
                            <div id="low-stock-container" style="margin-top: 10px; flex-grow: 1; max-height: 250px; overflow-y: auto;">
                                <div style="text-align: center; color: #888; font-size: 13px; margin-top: 20px;">
                                    <i class="fas fa-spinner fa-spin" style="margin-right: 5px;"></i> Loading...
                                </div>
                            </div>
                        </div>
"""

new_js_code = """
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
"""

for file_path in html_files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "Low Stock Products" not in content:
        # Insert after <div class="new-visual-grid">
        content = content.replace(
            '<div class="new-visual-grid">',
            '<div class="new-visual-grid">' + new_card_html
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

for file_path in js_files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "renderLowStockCard" not in content:
        # Call it after setting currentInventoryProducts
        content = content.replace(
            "currentInventoryProducts = data.products;",
            "currentInventoryProducts = data.products;\n        renderLowStockCard(data.products);"
        )
        # Append function definition
        content += new_js_code
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done updating HTML and JS")
