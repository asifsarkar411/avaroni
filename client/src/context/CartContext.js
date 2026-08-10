'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { calculateDiscountedPrice } from '@/utils/price';

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

    const addToCart = (product, quantity = 1, size = '', colour = '') => {
        let itemIdentifier = product._id;
        if (size) itemIdentifier += `-${size}`;
        if (colour) itemIdentifier += `-${colour}`;
        
        const existing = cart.find(item => (item.cartItemId || item._id) === itemIdentifier);
        
        if (existing) {
            saveCart(cart.map(item => (item.cartItemId || item._id) === itemIdentifier ? { ...item, quantity: Number(item.quantity || 0) + quantity } : item), cartKey);
        } else {
            saveCart([...cart, { ...product, cartItemId: itemIdentifier, selectedSize: size, selectedColour: colour, quantity }], cartKey);
        }
        
        // Show native toast if available
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Product added to cart!');
        }
    };

    const updateQuantity = (identifier, change) => {
        const existing = cart.find(item => (item.cartItemId || item._id) === identifier);
        if (existing) {
            const newQuantity = Number(existing.quantity || 0) + change;
            if (newQuantity <= 0) {
                removeFromCart(identifier);
            } else {
                saveCart(cart.map(item => (item.cartItemId || item._id) === identifier ? { ...item, quantity: newQuantity } : item), cartKey);
            }
        }
    };

    const removeFromCart = (identifier) => {
        saveCart(cart.filter(item => (item.cartItemId || item._id) !== identifier), cartKey);
    };

    const clearCart = () => {
        saveCart([], cartKey);
    };

    const cartCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    const cartTotal = cart.reduce((total, item) => {
        const itemPrice = calculateDiscountedPrice(item.price, item.discountType, item.discountValue);
        return total + (Number(itemPrice || 0) * Number(item.quantity || 0));
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
