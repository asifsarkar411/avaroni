import os
import re

files = [
    r'd:\ecomerce website\client\public\admin.js',
    r'd:\ecomerce website\public\admin.js'
]

for file_path in files:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Update stats bindings
    content = content.replace(
        "const totalRevenue = document.getElementById('total-revenue');",
        "const totalRevenue = document.getElementById('total-revenue');\n            const totalExpense = document.getElementById('total-expense');\n            const totalProfit = document.getElementById('total-profit');"
    )
    content = content.replace(
        "if (totalRevenue) totalRevenue.innerText = Number(data.stats.totalRevenue || 0).toLocaleString();",
        "if (totalRevenue) totalRevenue.innerText = Number(data.stats.totalRevenue || 0).toLocaleString();\n            if (totalExpense) totalExpense.innerText = Number(data.stats.totalExpense || 0).toLocaleString();\n            if (totalProfit) totalProfit.innerText = Number(data.stats.totalProfit || 0).toLocaleString();"
    )
    
    # 2. Add product payload
    content = content.replace(
        "name: document.getElementById('prod-name').value,\n        price: document.getElementById('prod-price').value,",
        "name: document.getElementById('prod-name').value,\n        buyingPrice: document.getElementById('prod-buying-price') ? document.getElementById('prod-buying-price').value : 0,\n        price: document.getElementById('prod-price').value,"
    )
    
    # 3. Edit product modal load
    content = content.replace(
        "document.getElementById('edit-prod-name').value = prod.name;\n    document.getElementById('edit-prod-price').value = prod.price;",
        "document.getElementById('edit-prod-name').value = prod.name;\n    if (document.getElementById('edit-prod-buying-price')) document.getElementById('edit-prod-buying-price').value = prod.buyingPrice || 0;\n    document.getElementById('edit-prod-price').value = prod.price;"
    )
    
    # 4. Edit product payload
    content = content.replace(
        "name: document.getElementById('edit-prod-name').value,\n        price: document.getElementById('edit-prod-price').value,",
        "name: document.getElementById('edit-prod-name').value,\n        buyingPrice: document.getElementById('edit-prod-buying-price') ? document.getElementById('edit-prod-buying-price').value : 0,\n        price: document.getElementById('edit-prod-price').value,"
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated JS files.")
