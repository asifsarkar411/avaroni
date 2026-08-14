'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MarqueeBanner() {
    const pathname = usePathname();
    const [settings, setSettings] = useState(null);
    const [isPaused, setIsPaused] = useState(false);

    // Only show on Homepage and Category / Subcategory pages
    const isAllowedPage = pathname === '/' || pathname.startsWith('/category');

    useEffect(() => {
        if (!isAllowedPage) return;

        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.settings) {
                    setSettings(data.settings);
                }
            } catch (err) {
                console.error("Error fetching marquee settings", err);
            }
        }
        fetchSettings();
    }, [isAllowedPage]);

    if (!isAllowedPage || !settings) return null;

    // Check if enabled (default true if not set)
    const isEnabled = settings.marqueeEnabled === undefined || settings.marqueeEnabled === 'true' || settings.marqueeEnabled === true;
    if (!isEnabled) return null;

    const marqueeText = settings.marqueeText || '✨ Welcome to AVARONI • Exclusive Traditional & Modern Wear • Free Delivery on Orders Above ৳2000! ✨';
    const speed = settings.marqueeSpeed || '25s';

    // Parse items by separator (bullet • or emoji or |) or treat whole text as repeating segments
    const messages = marqueeText.split('•').map(m => m.trim()).filter(Boolean);
    const renderMessages = messages.length > 0 ? messages : [marqueeText];

    return (
        <div 
            className={`top-marquee-banner ${isPaused ? 'is-paused' : ''}`}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onTouchCancel={() => setIsPaused(false)}
            title="Click or hold to pause marquee"
        >
            <div className="top-marquee-inner">
                {/* Loop 1 */}
                <div className="top-marquee-track" style={{ animationDuration: speed }}>
                    {renderMessages.map((msg, idx) => (
                        <div key={`m1-${idx}`} className="top-marquee-item">
                            <span>{msg}</span>
                            <i className="fas fa-sparkle"></i>
                        </div>
                    ))}
                    {renderMessages.map((msg, idx) => (
                        <div key={`m1-dup-${idx}`} className="top-marquee-item">
                            <span>{msg}</span>
                            <i className="fas fa-sparkle"></i>
                        </div>
                    ))}
                </div>

                {/* Loop 2 (seamless infinite scroll duplicate) */}
                <div className="top-marquee-track" style={{ animationDuration: speed }}>
                    {renderMessages.map((msg, idx) => (
                        <div key={`m2-${idx}`} className="top-marquee-item">
                            <span>{msg}</span>
                            <i className="fas fa-sparkle"></i>
                        </div>
                    ))}
                    {renderMessages.map((msg, idx) => (
                        <div key={`m2-dup-${idx}`} className="top-marquee-item">
                            <span>{msg}</span>
                            <i className="fas fa-sparkle"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
