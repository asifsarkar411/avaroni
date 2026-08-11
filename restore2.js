const fs = require('fs');

// Read files
let adminHtml = fs.readFileSync('./client/public/admin.html', 'utf8'); // Original file is UTF8
const adminOldHtml = fs.readFileSync('./client/public/admin_old.html', 'utf16le'); // PS redirection is UTF16-LE

let adminJs = fs.readFileSync('./client/public/admin.js', 'utf8');
const adminOldJs = fs.readFileSync('./client/public/admin_old.js', 'utf16le');

// Normalize CRLF
const adminOldHtmlNorm = adminOldHtml.replace(/\r\n/g, '\n');
const adminOldJsNorm = adminOldJs.replace(/\r\n/g, '\n');

// --- RESTORE HTML ---
let modifiedHtml = false;
let modifiedJs = false;

// 1. Restore Sidebar Manage Blogs button
if (!adminHtml.includes('data-target="manage-blogs"')) {
    const sidebarButtonMatch = /<button class="tab-btn" data-target="admin-settings">.*?<\/button>/s;
    if (adminHtml.match(sidebarButtonMatch)) {
        adminHtml = adminHtml.replace(
            sidebarButtonMatch,
            `$&
                <button class="tab-btn" data-target="manage-blogs"><i class="fas fa-blog"></i> <span>Manage Blogs</span></button>`
        );
        modifiedHtml = true;
    }
}

// 2. Restore Manage Blogs Tab Content
if (!adminHtml.includes('id="manage-blogs-tab"')) {
    const blogHtmlRegex = /<!-- Manage Blogs Section -->.*?<div id="manage-blogs-tab" class="tab-content">.*?<\/tbody>\s*<\/table>\s*<\/div>\s*<\/div>/s;
    const blogMatch = adminOldHtmlNorm.match(blogHtmlRegex);
    if (blogMatch) {
        adminHtml = adminHtml.replace(
            /<\/div>\s*<!-- End of admin-settings-tab -->\s*<\/div>\s*<\/main>/s,
            `    </div> <!-- End of admin-settings-tab -->\n\n            ${blogMatch[0]}\n        </div>\n    </main>`
        );
        modifiedHtml = true;
    }
}

// 3. Restore Scripts in HTML (Chart.js and Quill)
if (!adminHtml.includes('https://cdn.jsdelivr.net/npm/chart.js')) {
    adminHtml = adminHtml.replace(
        /<script src="invoice.js"><\/script>/,
        `<script src="invoice.js"></script>\n    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>`
    );
    modifiedHtml = true;
}

// 4. Restore Charts in HTML Dashboard
const oldDashMatch = adminOldHtmlNorm.match(/<div id="dashboard-tab" class="tab-content.*?<\/div>\s*<!-- End of dashboard-tab -->/s);
const newDashMatch = adminHtml.match(/<div id="dashboard-tab" class="tab-content.*?<\/div>\s*<!-- End of dashboard-tab -->/s);

if (oldDashMatch && newDashMatch) {
    adminHtml = adminHtml.replace(newDashMatch[0], oldDashMatch[0]);
    modifiedHtml = true;
}

// --- RESTORE JS ---

// 1. Restore Quill Editor Initialization
if (!adminJs.includes('initBlogEditor')) {
    const quillInit = `
// Initialize Quill Editor for Blogs
let quillEditor;
function initBlogEditor() {
    if (!quillEditor && document.getElementById('blog-editor-container')) {
        quillEditor = new Quill('#blog-editor-container', {
            theme: 'snow',
            placeholder: 'Write your blog content here...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }
}
`;
    adminJs = adminJs + "\n" + quillInit;
    modifiedJs = true;
}

// 2. Restore fetchAdminBlogs and renderAdminBlogs
if (!adminJs.includes('fetchAdminBlogs')) {
    const oldBlogCodeMatch = adminOldJsNorm.match(/\/\/ ==========================================\n\/\/ BLOG MANAGEMENT\n\/\/ ==========================================.*?(?=\/\/ ==========================================\n\/\/ HELPER FUNCTIONS)/s);
    if (oldBlogCodeMatch) {
        adminJs = adminJs.replace(/\/\/ ==========================================\r?\n\/\/ HELPER FUNCTIONS/, oldBlogCodeMatch[0] + "\n\n// ==========================================\n// HELPER FUNCTIONS");
        modifiedJs = true;
    }
}

// 3. Restore Chart.js Functions
if (!adminJs.includes('renderOrdersHourChart')) {
    const oldChartCodeMatch = adminOldJsNorm.match(/\/\/ ==========================================\n\/\/ CHART\.JS ADVANCED DASHBOARD VISUALS\n\/\/ ==========================================.*?(?=\/\/ ==========================================\n\/\/ BLOG MANAGEMENT)/s);
    if (oldChartCodeMatch) {
        adminJs = adminJs.replace(/\/\/ ==========================================\r?\n\/\/ BLOG MANAGEMENT/, oldChartCodeMatch[0] + "\n\n// ==========================================\n// BLOG MANAGEMENT");
        modifiedJs = true;
    }
}

// 4. Fix Tab Switch Logic
if (adminJs.includes("cleanTitle = \"Settings\";") && !adminJs.includes("cleanTitle = \"Manage Blogs\";")) {
    adminJs = adminJs.replace(/if\s*\(tabName\s*===\s*'admin-settings'\)\s*cleanTitle\s*=\s*"Settings";/, `$&
        if (tabName === 'manage-blogs') cleanTitle = "Manage Blogs";`);
    modifiedJs = true;
}

if (!adminJs.includes("fetchAdminBlogs();")) {
    adminJs = adminJs.replace(/if\s*\(tabName\s*===\s*'admin-settings'\)\s*fetchAdminSettings\(\);/, `$&
    if (tabName === 'manage-blogs') {
        fetchAdminBlogs();
        initBlogEditor();
    }`);
    modifiedJs = true;
}

if (!adminJs.includes("fetchDashboardVisuals()")) {
    adminJs = adminJs.replace(/fetchDashboardOverview\(\);/, `fetchDashboardOverview();\n        fetchDashboardVisuals();`);
    modifiedJs = true;
}

if (modifiedHtml) fs.writeFileSync('./client/public/admin.html', adminHtml, 'utf8');
if (modifiedJs) fs.writeFileSync('./client/public/admin.js', adminJs, 'utf8');

console.log("HTML Modified:", modifiedHtml);
console.log("JS Modified:", modifiedJs);
