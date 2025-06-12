// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    rating?: number;
    category?: string;
    isNew?: boolean;
    isOnSale?: boolean;
    discount?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    price,
    image,
    rating,
    category,
    isNew = false,
    isOnSale = false,
    discount = 0
}) => {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to detail page

        addToCart({
            id,
            name,
            price,
            image
        });

        toast({
            title: "Added to cart",
            description: `${name} has been added to your cart`,
        });
    };

    const discountedPrice = isOnSale && discount > 0
        ? price * (1 - discount / 100)
        : null;

    return (
        <Link to={`/products/${id}`} className="group">
            <div className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                <div className="relative pt-[100%]">
                    {/* Product image */}
                    <img
                        src={image}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isNew && (
                            <Badge className="bg-blue-500">New</Badge>
                        )}
                        {isOnSale && discount > 0 && (
                            <Badge className="bg-red-500">{discount}% OFF</Badge>
                        )}
                    </div>

                    {/* Quick add button */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            onClick={handleAddToCart}
                            className="w-full"
                            style={{ backgroundColor: "#7494ec" }}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    </div>
                </div>

                <div className="p-3">
                    {category && (
                        <p className="text-xs text-gray-500 mb-1">{category}</p>
                    )}
                    <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{name}</h3>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            {discountedPrice ? (
                                <div className="flex items-baseline gap-1">
                                    <span className="font-medium">${discountedPrice.toFixed(2)}</span>
                                    <span className="text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
                                </div>
                            ) : (
                                <span className="font-medium">${price.toFixed(2)}</span>
                            )}
                        </div>

                        {rating && (
                            <div className="flex items-center text-sm">
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                                <span>{rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;