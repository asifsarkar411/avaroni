const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        page.on('response', response => console.log('RESPONSE:', response.url(), response.status()));

        await page.goto('http://localhost:5000/women.html', { waitUntil: 'networkidle2' });
        console.log("Page loaded. Waiting for product card...");
        
        await page.waitForSelector('.product-card', { timeout: 10000 });
        console.log("Product card found! Clicking first product card...");

        // Evaluate to click the image of the first product card
        await page.evaluate(() => {
            const card = document.querySelector('.product-card');
            console.log("Card HTML:", card.outerHTML);
            const img = card.querySelector('.product-image');
            img.click();
        });

        console.log("Clicked! Waiting 2 seconds for modal...");
        await new Promise(r => setTimeout(r, 2000));
        
        const modalVisible = await page.evaluate(() => {
            const modal = document.getElementById('product-detail-modal');
            if (!modal) return 'modal not found';
            return modal.style.display;
        });
        
        console.log("Modal display style:", modalVisible);

        await browser.close();
    } catch (e) {
        console.error("Test failed:", e);
    }
})();
