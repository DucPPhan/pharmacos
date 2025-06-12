import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    updateQuantity: (id: string, change: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    subtotal: number;
    submitOrder: () => Promise<void>;
    isSubmitting: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load cart from localStorage on component mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart from localStorage', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                // If item exists, increase quantity by the specified amount
                return prevItems.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            } else {
                // If item doesn't exist, add it with the specified quantity
                return [...prevItems, { ...item, quantity }];
            }
        });
    };

    const updateQuantity = (id: string, change: number) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const removeItem = (id: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const submitOrder = async () => {
        if (cartItems.length === 0) return;

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const customerId = user.id;

        if (!customerId) {
            throw new Error('User not logged in');
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const orderData = {
                customerId,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                }))
            };

            const response = await fetch('http://localhost:10000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            // Clear cart after successful order
            clearCart();
        } finally {
            setIsSubmitting(false);
        }
    };

    const contextValue: CartContextType = {
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        submitOrder,
        isSubmitting
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};