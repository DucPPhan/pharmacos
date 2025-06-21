// src/contexts/CartContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '@/lib/api';

// --- Interfaces ---

// Represents an item within the cart state
export interface CartItem {
    id: string;          // The ID of the cart item itself (from the cart collection)
    productId: string;   // The ID of the product
    name: string;
    price: number;
    image: string;
    quantity: number;
}

// Represents the details needed to create an order
export interface OrderDetails {
    recipientName: string;
    phone: string;
    shippingAddress: string;
    note: string;
    // paymentMethod: string;
}

// Defines the shape of the context's value, available to consumers
interface CartContextType {
    cartItems: CartItem[];
    setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
    addToCart: (item: { id: string; name: string; price: number; image: string; }, quantity?: number) => void;
    updateQuantity: (id: string, change: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    subtotal: number;
    itemCount: number;
    isCartLoading: boolean;
    isSubmitting: boolean;
    submitOrder: (details: OrderDetails) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Define API endpoints for easy management
const API = {
    getCart: 'http://localhost:10000/api/cart',
    addItem: 'http://localhost:10000/api/cart/items',
    updateItem: (id: string) => `http://localhost:10000/api/cart/items/${id}`,
    deleteItem: (id: string) => `http://localhost:10000/api/cart/items/${id}`,
    createOrder: 'http://localhost:10000/api/orders',
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { toast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        //lưu token vào localStorage , khi login nó sẽ tự động lấy ra cho đúng với user , không có thì nó rỗng , sao m non v ĐứcPhan
        const fetchCart = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setCartItems([]);
                localStorage.removeItem("cart");
                return;
            }

            try {
                setIsCartLoading(true);
                const cartData = await apiFetch(API.getCart, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Map đúng với mọi trường hợp productId là object hoặc string, ưu tiên lấy image từ productId nếu có
                const mappedItems = (cartData.items || []).map((item: any) => ({
                    id: item._id,
                    productId: item.product?._id
                        || (typeof item.productId === "object" ? item.productId._id : item.productId),
                    name: item.product?.name
                        || item.productId?.name
                        || item.name
                        || "",
                    price: item.product?.price
                        || item.productId?.price
                        || item.unitPrice
                        || item.price
                        || 0,
                    image:
                        (item.productId?.images?.[0]?.url) ||
                        (item.product?.images?.[0]?.url) ||
                        '/placeholder.png',
                    quantity: item.quantity,
                }));
                setCartItems(mappedItems);
                localStorage.setItem("cart", JSON.stringify(mappedItems));
            } catch (error) {
                setCartItems([]);
                localStorage.removeItem("cart");
                console.error("Failed to fetch cart:", error);
            } finally {
                setIsCartLoading(false);
            }
        };

        fetchCart();
    }, [localStorage.getItem("token")]);

    const addToCart = async (product: { id: string; name: string; price: number; image: string; }, quantity: number = 1) => {
        const existingItem = cartItems.find(item => item.productId === product.id);

        // If item already exists, just update its quantity by calling updateQuantity with the CHANGE in quantity
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            await updateQuantity(existingItem.id, newQuantity - existingItem.quantity); // Pass the change, not the new total
            return;
        }

        // Optimistic UI: Add a temporary item to the cart immediately
        const tempId = `temp-${Date.now()}`;
        const newItem: CartItem = {
            id: tempId,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
        };
        const previousCart = [...cartItems];
        setCartItems(prev => [...prev, newItem]);
        toast({ title: "Added to cart", description: `${product.name} has been added.` });

        // Call API in the background
        try {
            const addedItemData = await apiFetch(API.addItem, {
                method: 'POST',
                body: JSON.stringify({ productId: product.id, quantity }),
            });
            // Replace the temporary item with the real one from the server
            setCartItems(prev => prev.map(item =>
                item.id === tempId ? { ...newItem, id: addedItemData.item._id } : item
            ));
        } catch (error) {
            toast({ title: "Error", description: "Could not add item to cart.", variant: "destructive" });
            setCartItems(previousCart); // Revert on failure
        }
    };

    const updateQuantity = async (itemId: string, change: number) => {
        const previousCart = [...cartItems];
        let newQuantity = 0;

        const updatedCart = previousCart.map(item => {
            if (item.id === itemId) {
                newQuantity = item.quantity + change;
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0); // Filter out items with quantity 0 or less

        // Optimistic UI Update
        setCartItems(updatedCart);

        if (newQuantity < 1) {
            // If item is removed, call DELETE API
            try {
                await apiFetch(API.deleteItem(itemId), { method: 'DELETE' });
                toast({ title: "Item removed", variant: 'destructive' });
            } catch (error) {
                toast({ title: "Error", description: "Could not remove item from cart.", variant: "destructive" });
                setCartItems(previousCart); // Revert on failure
            }
        } else {
            // If quantity is updated, call PATCH API
            try {
                await apiFetch(API.updateItem(itemId), {
                    method: 'PUT',
                    body: JSON.stringify({ quantity: newQuantity }),
                });
            } catch (error) {
                toast({ title: "Error", description: "Could not update item quantity.", variant: "destructive" });
                setCartItems(previousCart); // Revert on failure
            }
        }
    };

    const removeItem = async (itemId: string) => {
        const previousCart = [...cartItems];
        // Optimistic UI: Remove item immediately
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        toast({ title: "Item removed", variant: 'destructive' });

        try {
            await apiFetch(API.deleteItem(itemId), { method: 'DELETE' });
        } catch (error) {
            toast({ title: "Error", description: "Could not remove item from cart.", variant: "destructive" });
            setCartItems(previousCart); // Revert on failure
        }
    };

    const clearCart = async () => {
        const previousCart = [...cartItems];
        setCartItems([]); // Optimistic update
        try {
            // Note: A single API endpoint `DELETE /api/cart` would be more efficient
            const deletePromises = previousCart.map(async item =>
                await apiFetch(API.deleteItem(item.id), { method: 'DELETE' })
            );
            await Promise.all(deletePromises);
        } catch (error) {
            toast({ title: "Error", description: "Could not clear the cart.", variant: "destructive" });
            setCartItems(previousCart); // Revert on failure
        }
    };

    const submitOrder = async (details: OrderDetails) => {
        if (cartItems.length === 0) {
            throw new Error("Cannot submit order with an empty cart.");
        }

        const userString = localStorage.getItem('user');
        if (!userString) {
            throw new Error('User not logged in');
        }
        const user = JSON.parse(userString);
        const customerId = user.id;

        setIsSubmitting(true);
        try {
            // Create the complete order payload
            const orderData = {
                customerId,
                ...details, // Spread the recipient's details (name, phone, address, etc.)

                // Map the cart items to the format required by the backend API
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price
                })),
            };

            await apiFetch(API.createOrder, {
                method: 'POST',
                body: JSON.stringify(orderData),
            });

            // After successful order, clear the cart
            await clearCart();
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculated values derived from state
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    // The value provided to consumers of the context
    const contextValue: CartContextType = {
        cartItems,
        setCartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount, // Provide itemCount
        submitOrder,
        isSubmitting,
        isCartLoading,
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