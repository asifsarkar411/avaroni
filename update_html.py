import os
import re

public_dir = r"d:\ecomerce website\public"
client_public_dir = r"d:\ecomerce website\client\public"

sidebar_replacement = '''<div id="sidebar" class="sidebar">
        <div class="sidebar-header">
            <a href="index.html" class="sidebar-brand">
                <img src="./img/profile_image.jpg" alt="Logo" class="sidebar-logo">
                <span style="font-size:20px; font-weight:700; color:#333333; letter-spacing:0.5px;">AVARONI</span>
            </a>
            <a href="javascript:void(0)" id="close-sidebar-btn" class="close-btn" style="color:#555555; text-decoration:none; font-size:32px; border-bottom:none;">&times;</a>
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

def process_dir(directory):
    if not os.path.exists(directory): return
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            content = content.replace('<B>আভরণী</B>', '<B>AVARONI</B>')
            content = content.replace('<span>আভরণী</span>', '<span>AVARONI</span>')
            content = content.replace('আভরণী', 'AVARONI')

            pattern = re.compile(r'<div id="sidebar" class="sidebar">.*?</div>\s*(?=<div|<script|<footer|<!--)', re.DOTALL)
            new_content = pattern.sub(sidebar_replacement + '\n\n    ', content, count=1)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
            else:
                print(f"Regex missed in {filepath}")

process_dir(public_dir)
process_dir(client_public_dir)