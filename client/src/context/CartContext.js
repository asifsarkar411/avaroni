'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [cartKey, setCartKey] = useState('cart');

    useEffect(() => {
        let sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
        try {
            const stored = sessionStorage.getItem('cart_session_id');
            if (stored) {
                sessionId = stored;
            } else {
                sessionStorage.setItem('cart_session_id', sessionId);
            }
        } catch (e) {
            console.warn('sessionStorage is not available', e);
        }

        const key = `cart_${sessionId}`;
        setCartKey(key);

        try {
            const savedCart = localStorage.getItem(key);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (e) {
            console.warn('localStorage is not available or parsing failed', e);
        }
    }, []);

    const saveCart = (newCart, currentKey = cartKey) => {
        setCart(newCart);
        try {
            localStorage.setItem(currentKey, JSON.stringify(newCart));
        } catch (e) {
            console.warn('localStorage is not available', e);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            saveCart(cart.map(item => item._id === product._id ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item), cartKey);
        } else {
            saveCart([...cart, { ...product, quantity: 1 }], cartKey);
        }
        
        // Show native toast if available
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Product added to cart!');
        } else {
            alert('Added to cart!');
        }
    };

    const updateQuantity = (productId, change) => {
        const existing = cart.find(item => item._id === productId);
        if (existing) {
            const newQuantity = Number(existing.quantity || 0) + change;
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart(cart.map(item => item._id === productId ? { ...item, quantity: newQuantity } : item), cartKey);
            }
        }
    };

    const removeFromCart = (productId) => {
        saveCart(cart.filter(item => item._id !== productId), cartKey);
    };

    const clearCart = () => {
        saveCart([], cartKey);
    };

    const cartCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    const cartTotal = cart.reduce((total, item) => total + (Number(item.price || 0) * Number(item.quantity || 0)), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
