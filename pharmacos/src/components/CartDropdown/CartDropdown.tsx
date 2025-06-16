// MODIFIED: Added useState and AlertDialog components
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CartItem } from '@/contexts/CartContext';

const CartDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    // State to hold the item that is pending deletion
    const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeItem, subtotal } = useCart();

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    // Effect to close the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleCheckout = () => {
        setIsOpen(false);
        navigate('/cart');
    };

    // Handler for when the user confirms the deletion
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            removeItem(itemToDelete.id);
            setItemToDelete(null); // Close the dialog after deletion
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="relative p-2 text-white hover:text-primary focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Shopping cart"
            >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center rounded-full bg-primary text-white text-xs">
                        {itemCount}
                    </Badge>
                )}
            </button>

            <div
                className={`absolute right-0 mt-2 w-80 md:w-96 bg-white shadow-xl rounded-md border z-50 max-h-[90vh] md:max-h-[32rem] overflow-auto transform ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} transition-all duration-200 ease-out origin-top-right`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Your Cart ({itemCount} items)</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Close cart"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-gray-500">Your cart is empty</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 max-h-[20rem] overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 py-2">
                                        <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                                                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center border rounded-md">
                                                    <button
                                                        className="px-1 py-0.5"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="px-2 text-sm">{item.quantity}</span>
                                                    <button
                                                        className="px-1 py-0.5"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                {/* MODIFIED: The delete button now opens the dialog instead of deleting directly */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setItemToDelete(item);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-3" />

                            <div className="flex justify-between font-medium mb-3">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/cart');
                                    }}
                                >
                                    View Cart
                                </Button>
                                <Button
                                    className="w-full"
                                    onClick={handleCheckout}
                                    style={{ backgroundColor: "#7494ec" }}
                                >
                                    Checkout
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* AlertDialog component for deletion confirmation */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <strong>"{itemToDelete?.name}"</strong> from your cart.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CartDropdown;