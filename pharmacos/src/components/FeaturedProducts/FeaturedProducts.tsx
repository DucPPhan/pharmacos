// src/components/FeaturedProducts.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from '../productCard/ProductCard';

interface Product {
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

const FeaturedProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:10000/api/products/featured');
                if (!response.ok) {
                    throw new Error('Failed to fetch featured products');
                }
                const data = await response.json();

                // Transform the data to match our ProductCard props
                const formattedProducts = data.data.products.map((p: any) => ({
                    id: p._id || p.id,
                    name: p.name,
                    price: p.price,
                    image: Array.isArray(p.images) && p.images.length > 0
                        ? p.images.find((img: any) => img.isPrimary)?.url || p.images[0].url
                        : "",
                    rating: p.reviews && p.reviews.length > 0
                        ? p.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / p.reviews.length
                        : undefined,
                    category: p.category,
                    isNew: p.createdAt && (new Date().getTime() - new Date(p.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000),
                    isOnSale: !!p.discount,
                    discount: p.discount || 0
                }));

                setProducts(formattedProducts);
            } catch (error) {
                console.error('Error fetching featured products:', error);
                // Fallback to empty array
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg aspect-square mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Featured Products</h2>
                <Button variant="outline" asChild>
                    <a href="/products">View All</a>
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        rating={product.rating}
                        category={product.category}
                        isNew={product.isNew}
                        isOnSale={product.isOnSale}
                        discount={product.discount}
                    />
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">No featured products available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturedProducts;