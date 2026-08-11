import sys

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where the duplication starts
    marker = "    // 10. Settings & User Forms Submit\n// Custom Toast Notification System"
    if marker not in content:
        print(f"Marker not found in {filename}")
        return

    top_part, rest = content.split(marker, 1)

    # Rest contains the duplicated block, the stray DOMContentLoaded, and the Quill setup.
    # We need to skip all that until we reach:
    # "    // 1. Check if user is logged in" which is inside the nested DOMContentLoaded!
    # Wait! If the nested DOMContentLoaded has "// 1. Check if user is logged in", then it duplicated EVERYTHING!
    # Let's check what's inside the nested DOMContentLoaded.
    # From the earlier output, it goes:
    # let addProdDescEditor = null;
    # let editProdDescEditor = null;
    # document.addEventListener("DOMContentLoaded", () => {
    #     if (document.getElementById('add-prod-desc-editor')) { ... }
    #     if (document.getElementById('edit-prod-desc-editor')) { ... }
    #     // 1. Check if user is logged in
    #     if (!localStorage.getItem('adminToken')) {
