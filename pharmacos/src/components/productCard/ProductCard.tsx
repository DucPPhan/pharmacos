// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    categoryId?: number;
    inStock?: boolean;
    rating?: number;
    brand?: string;
    discount?: number;
}

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [showControls, setShowControls] = useState(false);
    const navigate = useNavigate();

    const { id, name, price, image, rating, inStock = true, discount } = product;

    // Calculate discounted price if applicable
    const discountedPrice = discount
        ? (price * (1 - discount / 100)).toFixed(2)
        : null;

    const handleProductClick = () => {
        navigate(`/product/${id}`);
    };

    const handleQuantityChange = (amount: number) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigating to product page
        if (onAddToCart) {
            onAddToCart(product, quantity);
        }
        // Reset quantity after adding to cart
        setQuantity(1);
        setShowControls(false);
    };

    return (
        <div
            className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <div className="relative" onClick={handleProductClick}>
                <div className="aspect-square overflow-hidden cursor-pointer">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Out of stock overlay */}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="outline" className="bg-white text-black font-medium">
                            Out of Stock
                        </Badge>
                    </div>
                )}

                {/* Discount badge */}
                {discount && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                        {discount}% OFF
                    </Badge>
                )}
            </div>

            <div className="p-4">
                <div className="cursor-pointer" onClick={handleProductClick}>
                    <h3 className="font-medium text-gray-900 truncate hover:text-primary transition-colors">
                        {name}
                    </h3>

                    {/* Price */}
                    <div className="mt-1 flex items-baseline gap-2">
                        {discountedPrice ? (
                            <>
                                <span className="text-lg font-bold">${discountedPrice}</span>
                                <span className="text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-lg font-bold">${price.toFixed(2)}</span>
                        )}
                    </div>

                    {/* Rating */}
                    {rating && (
                        <div className="flex items-center mt-1">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={14}
                                        className={`${star <= Math.round(rating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Add to cart section */}
                <div className={`mt-3 transition-opacity duration-200 ${showControls || quantity > 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded">
                            <button
                                className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={!inStock}
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-2 py-1 text-sm">{quantity}</span>
                            <button
                                className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                onClick={() => handleQuantityChange(1)}
                                disabled={!inStock}
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <Button
                            size="sm"
                            className="ml-2"
                            disabled={!inStock}
                            onClick={handleAddToCart}
                            style={{ backgroundColor: '#7494ec' }}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;