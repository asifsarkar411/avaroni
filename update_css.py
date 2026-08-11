import os
import re

css_to_replace = """
.sidebar {
    height: 100vh;
    width: 280px;
    position: fixed;
    z-index: 2000;
    top: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: -4px 0 25px rgba(0, 0, 0, 0.1);
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    padding-top: 15px;
}

.sidebar.active {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px 15px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    margin-bottom: 5px;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: #333333;
    border-bottom: none !important;
    padding: 0 !important;
}

.sidebar-brand:hover {
    background-color: transparent !important;
}

.sidebar-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eaeaea;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sidebar-brand span {
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    letter-spacing: 0.5px;
}

.sidebar a {
    padding: 15px 25px;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    color: #444444;
    display: block;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar a i {
    width: 25px; /* Aligns the icons neatly */
    color: #777777; /* Your brand color */
}

.sidebar a:hover {
    color: #ff4d4f;
    background-color: rgba(0, 0, 0, 0.02);
    padding-left: 35px;
    box-shadow: inset 6px 0 0 #ff4d4f;
}
.sidebar a i:hover {
    color: #ff4d4f;
    background-color: transparent;
}

/* The X Close Button */
.sidebar .close-btn {
    position: relative;
    top: auto;
    right: auto;
    font-size: 32px;
    border-bottom: none; /* Removes the underline from the X */
    padding: 0;
    color: #555555;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
}

.sidebar .close-btn:hover {
    background-color: transparent;
    color: #ff4d4f;
    transform: scale(1.1);
}
"""

def update_css_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(r'\.sidebar\s*\{.*?(?=\.slider-card-wrapper)', re.DOTALL)
    new_content = pattern.sub(css_to_replace + '\n\n', content, count=1)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Failed to match in {filepath}")

update_css_file(r'd:\ecomerce website\public\style.css')
update_css_file(r'd:\ecomerce website\client\public\style.css')