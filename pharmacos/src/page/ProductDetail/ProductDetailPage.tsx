// src/page/product/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, ChevronRight, Info, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import ProductGrid from '../../components/ProductGrid';

// Product interface
interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    categoryId: number;
    inStock: boolean;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
    brand?: string;
    description?: string;
    benefits?: string[];
    ingredients?: string;
    usage?: string;
    specifications?: Record<string, string>;
    discount?: number;
}

// Reviews interface
interface Review {
    id: string;
    userName: string;
    rating: number;
    date: string;
    title: string;
    comment: string;
    helpful: number;
}

// Mock product data
const mockProducts: Record<string, Product> = {
    "1": {
        id: "1",
        name: "Vitamin C Serum",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
            "https://images.unsplash.com/photo-1611930022073-84f3e05cd886?w=800&q=80",
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80"
        ],
        category: "Skincare",
        categoryId: 2,
        inStock: true,
        tags: ["antioxidant", "brightening", "anti-aging"],
        rating: 4.8,
        reviewCount: 127,
        brand: "The Ordinary",
        description: "This serum features 15% pure vitamin C (L-ascorbic acid) for enhanced environmental protection, improved visible signs of aging, and brightening. The addition of hyaluronic acid spheres helps achieve visible surface smoothing alongside the benefits of vitamin C.",
        benefits: [
            "Brightens skin tone and reduces hyperpigmentation",
            "Fights free radical damage from UV rays and pollution",
            "Stimulates collagen production for firmer skin",
            "Improves skin texture and reduces fine lines"
        ],
        ingredients: "Aqua (Water), Ascorbic Acid, Propanediol, Glycerin, Triethanolamine, Aminomethyl Propanol, Hyaluronic Acid, Phenoxyethanol, Tocopherol, Sodium Hyaluronate, Potassium Sorbate, Sodium Benzoate.",
        usage: "Apply a few drops to face in the morning after cleansing and before moisturizing. Due to high concentration of Vitamin C, a slight tingling sensation might occur during the first 1-2 weeks of use.",
        specifications: {
            "Size": "30ml",
            "Skin Type": "All skin types",
            "Concerns": "Dark spots, Dullness, Fine lines",
            "Formulation": "Lightweight serum",
            "Fragrance": "Fragrance-free"
        },
        discount: 15
    }
};

// Mock related products
const relatedProducts: Product[] = [
    {
        id: "2",
        name: "Hydrating Face Cream",
        price: 32.5,
        image: "https://images.unsplash.com/photo-1611930022073-84f3e05cd886?w=800&q=80",
        category: "Skincare",
        categoryId: 2,
        inStock: true,
        rating: 4.5,
        brand: "CeraVe"
    },
    {
        id: "4",
        name: "Sunscreen SPF 50",
        price: 18.75,
        image: "https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=800&q=80",
        category: "Skincare",
        categoryId: 2,
        inStock: true,
        rating: 4.7,
        brand: "La Roche-Posay"
    },
    {
        id: "11",
        name: "Retinol Serum",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1600428877878-1a0ff561d8b9?w=800&q=80",
        category: "Skincare",
        categoryId: 2,
        inStock: true,
        rating: 4.6,
        brand: "The Ordinary"
    },
    {
        id: "12",
        name: "Gentle Facial Cleanser",
        price: 14.50,
        image: "https://images.unsplash.com/photo-1629732097571-b042b5abb94f?w=800&q=80",
        category: "Skincare",
        categoryId: 2,
        inStock: true,
        rating: 4.4,
        brand: "CeraVe"
    }
];

// Mock reviews
const mockReviews: Review[] = [
    {
        id: "r1",
        userName: "Sarah Johnson",
        rating: 5,
        date: "2023-08-15",
        title: "Amazing for my hyperpigmentation",
        comment: "I've been using this serum for 3 months now and have seen a significant reduction in my dark spots. My skin is brighter and more even-toned. Will definitely repurchase!",
        helpful: 28
    },
    {
        id: "r2",
        userName: "Michael Chen",
        rating: 4,
        date: "2023-07-22",
        title: "Good results but slight irritation",
        comment: "The serum definitely brightened my skin and improved texture, but I experienced some tingling and redness initially. After reducing to every other day usage, it's been much better.",
        helpful: 15
    },
    {
        id: "r3",
        userName: "Emma Williams",
        rating: 5,
        date: "2023-09-05",
        title: "Holy grail product!",
        comment: "This has transformed my dull, uneven skin. I've been using it for 6 weeks and already notice a huge difference. My makeup goes on smoother and I even feel confident going without foundation now.",
        helpful: 42
    },
    {
        id: "r4",
        userName: "David Thompson",
        rating: 3,
        date: "2023-06-30",
        title: "Works but oxidizes quickly",
        comment: "The serum does what it claims, but I noticed it turned orange after about 3 weeks. I store it properly in a cool, dark place too. For the price, I expected better packaging to prevent oxidation.",
        helpful: 19
    }
];

// Star rating component
const StarRating: React.FC<{ rating: number, size?: number }> = ({ rating, size = 16 }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${star <= Math.round(rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                />
            ))}
        </div>
    );
};

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [reviews] = useState<Review[]>(mockReviews);

    // Fetch product data
    useEffect(() => {
        // In a real app, you would fetch from an API
        // For this example, we'll use the mock data
        setLoading(true);
        setTimeout(() => {
            if (productId && mockProducts[productId]) {
                setProduct(mockProducts[productId]);
                setSelectedImage(0);
            }
            setLoading(false);
        }, 500);
    }, [productId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
                <div className="animate-pulse text-center">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
                <Link to="/products">
                    <Button style={{ backgroundColor: '#7494ec' }}>
                        Browse All Products
                    </Button>
                </Link>
            </div>
        );
    }

    // Calculate discounted price if applicable
    const discountedPrice = product.discount
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : null;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-primary flex items-center">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link to={`/category/${product.categoryId}`} className="hover:text-primary">
                    {product.category}
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-700 font-medium truncate">{product.name}</span>
            </nav>

            {/* Product details section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Product images */}
                <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-white aspect-square">
                        <img
                            src={product.images?.[selectedImage] || product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Thumbnail images */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`border rounded overflow-hidden w-20 h-20 flex-shrink-0 ${selectedImage === index ? 'border-primary border-2' : 'border-gray-200'
                                        }`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product info */}
                <div className="space-y-6">
                    <div>
                        {product.brand && (
                            <Link to={`/brand/${product.brand}`} className="text-primary text-sm font-medium hover:underline">
                                {product.brand}
                            </Link>
                        )}
                        <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>

                        <div className="flex items-center mt-2 space-x-4">
                            {product.rating && (
                                <div className="flex items-center">
                                    <StarRating rating={product.rating} />
                                    <span className="ml-2 text-sm text-gray-600">
                                        {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline space-x-3">
                        {discountedPrice ? (
                            <>
                                <span className="text-2xl font-bold text-primary">${discountedPrice}</span>
                                <span className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                                <Badge className="bg-red-500">{product.discount}% OFF</Badge>
                            </>
                        ) : (
                            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                        )}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center">
                        {product.inStock ? (
                            <Badge className="bg-green-500 text-white">In Stock</Badge>
                        ) : (
                            <Badge variant="outline" className="text-red-500 border-red-500">Out of Stock</Badge>
                        )}
                    </div>

                    {/* Short description */}
                    <p className="text-gray-600">{product.description}</p>

                    {/* Product benefits */}
                    {product.benefits && (
                        <div className="space-y-2">
                            <h3 className="font-medium">Benefits:</h3>
                            <ul className="space-y-1">
                                {product.benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Add to cart */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center border rounded-md">
                                <button
                                    className="px-3 py-1 text-xl"
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    disabled={!product.inStock}
                                >
                                    -
                                </button>
                                <span className="px-3 py-1">{quantity}</span>
                                <button
                                    className="px-3 py-1 text-xl"
                                    onClick={() => setQuantity(prev => prev + 1)}
                                    disabled={!product.inStock}
                                >
                                    +
                                </button>
                            </div>
                            <Button
                                className="flex-grow flex items-center justify-center gap-2"
                                disabled={!product.inStock}
                                style={{ backgroundColor: '#7494ec' }}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                                <span className="text-gray-500">{key}</span>
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product details tabs */}
            <div className="mb-16">
                <Tabs defaultValue="description">
                    <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto mb-6">
                        <TabsTrigger
                            value="description"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
                        >
                            Description
                        </TabsTrigger>
                        <TabsTrigger
                            value="ingredients"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
                        >
                            Ingredients
                        </TabsTrigger>
                        <TabsTrigger
                            value="howToUse"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
                        >
                            How to Use
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
                        >
                            Reviews ({reviews.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-0">
                        <div className="prose max-w-none">
                            <p className="mb-4">{product.description}</p>

                            {product.benefits && (
                                <>
                                    <h3 className="text-lg font-medium mb-2">Key Benefits</h3>
                                    <ul className="space-y-2">
                                        {product.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="ingredients" className="mt-0">
                        <div className="prose max-w-none">
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <div className="flex items-start mb-4">
                                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-600">
                                        Ingredients are subject to change. Please refer to the product packaging for the most up-to-date ingredient list.
                                    </p>
                                </div>
                                <p className="whitespace-pre-line leading-relaxed">{product.ingredients}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="howToUse" className="mt-0">
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-medium mb-2">Directions</h3>
                            <p className="mb-4">{product.usage}</p>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                                <div className="flex">
                                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                                    <p className="text-sm">
                                        For best results, use as part of your morning skincare routine. Always follow with sunscreen during the day.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-0">
                        <div className="space-y-8">
                            {/* Reviews summary */}
                            <div className="flex flex-col md:flex-row gap-6 md:items-center p-6 bg-gray-50 rounded-lg">
                                <div className="text-center md:border-r md:pr-6">
                                    <div className="text-4xl font-bold text-primary">{product.rating?.toFixed(1)}</div>
                                    <StarRating rating={product.rating || 0} size={20} />
                                    <div className="text-sm text-gray-500 mt-1">{product.reviewCount} reviews</div>
                                </div>

                                <div className="flex-grow">
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                            const percentage = (count / reviews.length) * 100;

                                            return (
                                                <div key={star} className="flex items-center">
                                                    <div className="w-12 text-sm text-gray-600">{star} stars</div>
                                                    <div className="flex-grow mx-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="bg-primary h-2.5 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="w-8 text-xs text-gray-500">{percentage.toFixed(0)}%</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <Button style={{ backgroundColor: '#7494ec' }}>Write a Review</Button>
                                </div>
                            </div>

                            {/* Individual reviews */}
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b pb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{review.userName}</div>
                                                <div className="flex items-center mt-1">
                                                    <StarRating rating={review.rating} />
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        {new Date(review.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <button className="text-xs">Helpful ({review.helpful})</button>
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium mt-3">{review.title}</h4>
                                        <p className="mt-2 text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Related products */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">You Might Also Like</h2>
                    <Link to={`/category/${product.categoryId}`} className="text-primary hover:underline">
                        View All
                    </Link>
                </div>
                <ProductGrid products={relatedProducts} />
            </div>
        </div>
    );
};

export default ProductDetailPage;