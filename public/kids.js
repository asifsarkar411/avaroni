document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadProducts === 'function') {
        // Change this to lowercase 'kids' to match your database
        loadProducts('kids'); 
    }
});