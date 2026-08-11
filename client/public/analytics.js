// AVARONI Autonomous Activity & Analytics Tracker
(function() {
    // Basic setup
    let sessionId = sessionStorage.getItem('avaroni_sid');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('avaroni_sid', sessionId);
    }

    let activityBuffer = [];
    const MAX_BUFFER = 10;
    const FLUSH_INTERVAL = 5000; // 5 seconds

    // List of HTML tags and roles that are inherently interactive
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
    const interactiveRoles = ['button', 'link', 'checkbox', 'menuitem', 'option', 'radio', 'switch', 'tab'];

    // Send payload to backend
    function flushActivity() {
        if (activityBuffer.length === 0) return;
        
        const payload = [...activityBuffer];
        activityBuffer = []; // Clear buffer immediately

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Analytics flush failed:", err));
    }

    // Interval to flush normal clicks
    setInterval(flushActivity, FLUSH_INTERVAL);

    // Track clicks globally
    document.addEventListener('click', function(e) {
        let isInteractive = false;
        let target = e.target;
        let originalTarget = target;

        // Traverse DOM up to check if click was on or inside an interactive element
        while (target && target !== document.body) {
            const tag = target.tagName;
            const role = target.getAttribute('role');
            const cursor = window.getComputedStyle(target).cursor;
            const hasOnClick = target.hasAttribute('onclick') || (typeof target.onclick === 'function');
            const isLabelFor = tag === 'LABEL' && target.hasAttribute('for');

            if (
                interactiveTags.includes(tag) || 
                interactiveRoles.includes(role) || 
                cursor === 'pointer' || 
                hasOnClick ||
                isLabelFor
            ) {
                isInteractive = true;
                break;
            }
            target = target.parentElement;
        }

        const type = isInteractive ? 'click' : 'dead_click';
        let textContent = originalTarget.innerText || originalTarget.value || '';
        textContent = textContent.replace(/\s+/g, ' ').trim().substring(0, 50);

        activityBuffer.push({
            sessionId,
            type,
            page: window.location.pathname,
            element: originalTarget.tagName,
            className: originalTarget.className,
            text: textContent,
            timestamp: new Date()
        });

        // Flush immediately if buffer is full
        if (activityBuffer.length >= MAX_BUFFER) {
            flushActivity();
        }
    }, true); // Capture phase to catch clicks even if propagation is stopped

    // Track Exit Pages
    window.addEventListener('beforeunload', function() {
        // Send any remaining buffered clicks + the exit event
        const exitEvent = {
            sessionId,
            type: 'exit_page',
            page: window.location.pathname,
            timestamp: new Date()
        };
        
        activityBuffer.push(exitEvent);
        const payload = JSON.stringify(activityBuffer);
        
        // Use sendBeacon as it is reliable during page unload
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/track', payload);
        } else {
            // Fallback for older browsers (might not complete, but best effort)
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true
            });
        }
    });
})();
