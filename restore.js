const fs = require('fs');

// Read files
let adminHtml = fs.readFileSync('./client/public/admin.html', 'utf8');
const adminOldHtml = fs.readFileSync('./client/public/admin_old.html', 'utf8');

let adminJs = fs.readFileSync('./client/public/admin.js', 'utf8');
const adminOldJs = fs.readFileSync('./client/public/admin_old.js', 'utf8');

// --- RESTORE HTML ---

// 1. Restore Sidebar Manage Blogs button
if (!adminHtml.includes('data-target="manage-blogs"')) {
    const sidebarButtonMatch = /<button class="tab-btn" data-target="admin-settings">.*?<\/button>/s;
    if (adminHtml.match(sidebarButtonMatch)) {
        adminHtml = adminHtml.replace(
            sidebarButtonMatch,
            `$&
                <button class="tab-btn" data-target="manage-blogs"><i class="fas fa-blog"></i> <span>Manage Blogs</span></button>`
        );
    }
}

// 2. Restore Manage Blogs Tab Content
if (!adminHtml.includes('id="manage-blogs-tab"')) {
    const blogHtmlRegex = /<!-- Manage Blogs Section -->.*?<div id="manage-blogs-tab" class="tab-content">.*?<\/tbody>\s*<\/table>\s*<\/div>\s*<\/div>/s;
    const blogMatch = adminOldHtml.match(blogHtmlRegex);
    if (blogMatch) {
        adminHtml = adminHtml.replace(
            /<\/div>\s*<!-- End of admin-settings-tab -->\s*<\/div>\s*<\/main>/s,
            `    </div> <!-- End of admin-settings-tab -->\n\n            ${blogMatch[0]}\n        </div>\n    </main>`
        );
    }
}

// 3. Restore Scripts in HTML (Chart.js and Quill)
if (!adminHtml.includes('https://cdn.jsdelivr.net/npm/chart.js')) {
    adminHtml = adminHtml.replace(
        /<script src="invoice.js"><\/script>/,
        `<script src="invoice.js"></script>\n    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>`
    );
}

// 4. Restore Charts in HTML Dashboard
const oldDashMatch = adminOldHtml.match(/<div id="dashboard-tab" class="tab-content active">.*?<\/div>\s*<!-- End of dashboard-tab -->/s);
const newDashMatch = adminHtml.match(/<div id="dashboard-tab" class="tab-content active">.*?<\/div>\s*<!-- End of dashboard-tab -->/s);

if (oldDashMatch && newDashMatch) {
    adminHtml = adminHtml.replace(newDashMatch[0], oldDashMatch[0]);
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
}

// 2. Restore fetchAdminBlogs and renderAdminBlogs
if (!adminJs.includes('fetchAdminBlogs')) {
    const oldBlogCodeMatch = adminOldJs.match(/\/\/ ==========================================\s*\/\/ BLOG MANAGEMENT\s*\/\/ ==========================================.*?(?=\/\/ ==========================================\s*\/\/ HELPER FUNCTIONS)/s);
    if (oldBlogCodeMatch) {
        adminJs = adminJs.replace(/\/\/ ==========================================\s*\/\/ HELPER FUNCTIONS/, oldBlogCodeMatch[0] + "\n\n// ==========================================\n// HELPER FUNCTIONS");
    }
}

// 3. Restore Chart.js Functions
if (!adminJs.includes('renderOrdersHourChart')) {
    const oldChartCodeMatch = adminOldJs.match(/\/\/ ==========================================\s*\/\/ CHART\.JS ADVANCED DASHBOARD VISUALS\s*\/\/ ==========================================.*?(?=\/\/ ==========================================\s*\/\/ BLOG MANAGEMENT)/s);
    if (oldChartCodeMatch) {
        adminJs = adminJs.replace(/\/\/ ==========================================\s*\/\/ BLOG MANAGEMENT/, oldChartCodeMatch[0] + "\n\n// ==========================================\n// BLOG MANAGEMENT");
    }
}

// 4. Fix Tab Switch Logic
adminJs = adminJs.replace(/if \(tabName === 'admin-settings'\) cleanTitle = "Settings";/, `if (tabName === 'admin-settings') cleanTitle = "Settings";\n        if (tabName === 'manage-blogs') cleanTitle = "Manage Blogs";`);

if (!adminJs.includes("if (tabName === 'manage-blogs') fetchAdminBlogs();")) {
    adminJs = adminJs.replace(/if \(tabName === 'admin-settings'\) fetchAdminSettings\(\);/, `if (tabName === 'admin-settings') fetchAdminSettings();\n    if (tabName === 'manage-blogs') {\n        fetchAdminBlogs();\n        initBlogEditor();\n    }`);
}

if (!adminJs.includes("fetchDashboardVisuals()")) {
    adminJs = adminJs.replace(/fetchDashboardOverview\(\);/, `fetchDashboardOverview();\n        fetchDashboardVisuals(); // Load new visual charts`);
}

fs.writeFileSync('./client/public/admin.html', adminHtml, 'utf8');
fs.writeFileSync('./client/public/admin.js', adminJs, 'utf8');

console.log("Recovery complete.");
