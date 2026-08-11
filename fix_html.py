import os
import re

public_dir = r"d:\ecomerce website\public"

sidebar_replacement = '''<div id="sidebar" class="sidebar">
        <div class="sidebar-header">
            <a href="/" class="sidebar-brand">
                <img src="./img/profile_image.jpg" alt="Logo" class="sidebar-logo">
                <span style="font-size:20px; font-weight:700; color:#333333; letter-spacing:0.5px;">AVARONI</span>
            </a>
            <a href="javascript:void(0)" id="close-sidebar-btn" class="close-btn" style="color:#555555; text-decoration:none; font-size:32px;">&times;</a>
        </div>
        <div id="sidebar-categories-container"></div>
        <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 15px 0;">
        <div style="padding: 10px 15px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Quick Links</div>
        <a href="track-order.html"><i class="fas fa-truck"></i> Track Order</a>
        <a href="faq.html"><i class="fas fa-question-circle"></i> FAQ</a>
        <a href="blog.html"><i class="fas fa-newspaper"></i> Blog</a>
        <a href="sitemap.html"><i class="fas fa-sitemap"></i> Sitemap</a>
        <a href="about.html"><i class="fas fa-info-circle"></i> About Us</a>
        <a href="contact.html"><i class="fas fa-envelope"></i> Contact</a>
    </div>'''

for filename in os.listdir(public_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(public_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace navbar brand
        content = re.sub(r'<B>?????</B>', r'<B>AVARONI</B>', content)
        content = re.sub(r'<span>?????</span>', r'<span>AVARONI</span>', content)
        content = re.sub(r'?????', r'AVARONI', content)

        # Replace Sidebar block
        # We find <div id="sidebar" class="sidebar"> ... </div>
        # Use regex dotall to match the whole block up to the closing </div> of sidebar
        # The sidebar ends before <div class="some-other-class"> usually, let's do a non-greedy match until <div
        
        # Actually, let's just replace the exact sidebar block by finding <div id="sidebar" class="sidebar"> and the corresponding closing div.
        
        pattern = r'<div id="sidebar" class="sidebar">.*?</div>\s*(?=<div|<script|<footer|<!--)'
        content = re.sub(pattern, sidebar_replacement + '\n\n    ', content, flags=re.DOTALL)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated {filename}")
