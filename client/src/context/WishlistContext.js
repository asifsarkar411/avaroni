'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);
    
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist_items');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error('Error parsing wishlist', e);
            }
        }
    }, []);

    const saveWishlist = (newList) => {
        setWishlist(newList);
        localStorage.setItem('wishlist_items', JSON.stringify(newList));
    };

    const toggleWishlist = (product) => {
        const existing = wishlist.find(item => item._id === product._id);
        if (existing) {
            saveWishlist(wishlist.filter(item => item._id !== product._id));
        } else {
            saveWishlist([...wishlist, product]);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    return useContext(WishlistContext);
}
