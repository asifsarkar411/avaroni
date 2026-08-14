'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HomePopup() {
    const pathname = usePathname();
    const [popupData, setPopupData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // ONLY show on homepage
        if (pathname !== '/') return;

        // Check if already shown once in this session
        try {
            const hasSeen = sessionStorage.getItem('avaroni_home_popup_seen');
            if (hasSeen) return;
        } catch (e) {}

        async function loadPopup() {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (!data.success || !data.settings) return;

                const { popupImage, popupEnabled, popupLink } = data.settings;
                const isEnabled = popupEnabled === undefined || popupEnabled === 'true' || popupEnabled === true;

                if (isEnabled && popupImage && popupImage.trim()) {
                    setPopupData({
                        image: popupImage.trim(),
                        link: popupLink && popupLink.trim() ? popupLink.trim() : ''
                    });
                    
                    // Show popup with a smooth slight delay
                    const timer = setTimeout(() => {
                        setIsOpen(true);
                        try {
                            sessionStorage.setItem('avaroni_home_popup_seen', 'true');
                        } catch (e) {}
                    }, 800);

                    return () => clearTimeout(timer);
                }
            } catch (err) {
                console.error("Error loading home popup:", err);
            }
        }

        loadPopup();
    }, [pathname]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen || !popupData) return null;

    const handleClose = (e) => {
        e.stopPropagation();
        setIsOpen(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

    return (
        <div 
            className={`home-welcome-popup-overlay ${isOpen ? 'active' : ''}`} 
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
        >
            <div className="home-welcome-popup-box">
                {/* Floating Cross Close Button */}
                <button 
                    type="button" 
                    className="home-welcome-popup-close" 
                    onClick={handleClose} 
                    aria-label="Close Popup"
                    title="Close"
                >
                    <i className="fas fa-times"></i>
                </button>

                {popupData.link ? (
                    <a href={popupData.link} className="home-welcome-popup-link" onClick={() => setIsOpen(false)}>
                        <img 
                            src={popupData.image} 
                            alt="Special Announcement" 
                            className="home-welcome-popup-img"
                        />
                    </a>
                ) : (
                    <img 
                        src={popupData.image} 
                        alt="Special Announcement" 
                        className="home-welcome-popup-img"
                    />
                )}
            </div>
        </div>
    );
}
