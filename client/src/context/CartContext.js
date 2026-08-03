'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [cartKey, setCartKey] = useState('cart');

    useEffect(() => {
        let sessionId = sessionStorage.getItem('cart_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
            sessionStorage.setItem('cart_session_id', sessionId);
        }
        const key = `cart_${sessionId}`;
        setCartKey(key);

        const savedCart = localStorage.getItem(key);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error parsing cart from localStorage', e);
            }
        }
    }, []);

    const saveCart = (newCart, currentKey = cartKey) => {
        setCart(newCart);
        localStorage.setItem(currentKey, JSON.stringify(newCart));
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            saveCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item), cartKey);
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

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
