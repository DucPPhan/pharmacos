// src/contexts/CartContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api'; // Assuming you have a centralized api helper

// Define a clear interface for what an item in the cart looks like
// Exporting it allows other components to use this type
export interface CartItem {
    id: string;       // Product ID
    name: string;
    price: number;
    image: string;
    quantity: number;
}

// Define an interface for the details needed to submit an order
export interface OrderDetails {
    recipientName: string;
    phone: string;
    shippingAddress: string;
    note: string;
    paymentMethod: string;
}

// Define the shape of the context's value
interface CartContextType {
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>; // ✅ Thêm dòng này
    addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    updateQuantity: (id: string, change: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    subtotal: number;
    itemCount: number;
    submitOrder: (details: OrderDetails) => Promise<void>;
    isSubmitting: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// A key for storing the cart in localStorage
const CART_STORAGE_KEY = 'pharmacos_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        // Load cart from localStorage on initial render
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Failed to parse cart from localStorage', error);
            return [];
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                // If item exists, increase its quantity
                return prevItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            } else {
                // If item doesn't exist, add it to the cart
                return [...prevItems, { ...item, quantity }];
            }
        });
    };

    const updateQuantity = (id: string, change: number) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantity + change); // Quantity cannot be less than 1
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0) // Ensure items with 0 quantity are removed
        );
    };

    const removeItem = (id: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Calculate subtotal
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Calculate total number of items
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const submitOrder = async (details: OrderDetails) => {
        if (cartItems.length === 0) {
            throw new Error("Cart is empty.");
        }

        const userString = localStorage.getItem('user');
        if (!userString) {
            throw new Error('User not logged in');
        }
        const user = JSON.parse(userString);
        const customerId = user.id;

        setIsSubmitting(true);

        try {
            const orderData = {
                customerId,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                })),
                ...details
            };

            // Using the centralized apiFetch function for consistency
            await apiFetch('http://localhost:10000/api/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            // Clear cart after successful order submission
            clearCart();
        } finally {
            setIsSubmitting(false);
        }
    };

    // The value provided to consumers of the context
    const contextValue: CartContextType = {
        cartItems,
        setCartItems, // ✅ Thêm dòng này
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        submitOrder,
        isSubmitting
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook for easy consumption of the cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};