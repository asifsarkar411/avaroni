
        // We put this in a small timeout to ensure script.js has fully loaded first
        setTimeout(() => {
            if(typeof loadProducts === 'function') {
                loadProducts('women'); 
            } else {
                console.error("loadProducts function not found. Make sure you updated script.js!");
            }
        }, 100);
