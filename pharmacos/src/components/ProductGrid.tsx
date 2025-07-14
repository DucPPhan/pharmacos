import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Filter, Star, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating?: number;
  discount?: number;
  isFavorite?: boolean;
}

interface ProductGridProps {
  products?: Product[];
  title?: string;
  showFilters?: boolean;
  onAddToCart?: (product: Product, quantity: number) => void;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
}

const ProductGrid = ({
  products = [
    {
      id: "1",
      name: "Vitamin C Serum",
      price: 24.99,
      image:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
      category: "Skincare",
      inStock: true,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Pain Relief Tablets",
      price: 12.5,
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      category: "Medication",
      inStock: true,
      rating: 4.2,
    },
    {
      id: "3",
      name: "Hydrating Face Cream",
      price: 32.99,
      image:
        "https://images.unsplash.com/photo-1593642634402-b0eb5e2eebc9?w=400&q=80",
      category: "Skincare",
      inStock: true,
      rating: 4.5,
    },
    {
      id: "4",
      name: "Allergy Relief Spray",
      price: 18.75,
      image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80",
      category: "Medication",
      inStock: false,
      rating: 3.9,
    },
    {
      id: "5",
      name: "Collagen Supplement",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
      category: "Supplements",
      inStock: true,
      rating: 4.3,
      discount: 10,
    },
    {
      id: "6",
      name: "Anti-Aging Eye Cream",
      price: 45.0,
      image:
        "https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&q=80",
      category: "Skincare",
      inStock: true,
      rating: 4.7,
      discount: 15,
    },
  ],
  title = "",
  showFilters = true,
  onAddToCart,
  onFavoriteToggle,
}: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  // Keep track of quantity for each product
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  // Initialize local products from props
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const isLoggedIn = !!localStorage.getItem("token");

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? localProducts
      : localProducts.filter(
          (product) =>
            product.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "rating" && a.rating && b.rating) return b.rating - a.rating;
    return 0; // default sorting
  });

  // Get unique categories
  const categories = [
    "all",
    ...new Set(localProducts.map((product) => product.category)),
  ];

  // Pagination logic
  const productsPerPage = 6;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  // Initialize quantity if not set
  const getQuantity = (productId: string): number => {
    return quantities[productId] || 1;
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, change: number) => {
    const currentQty = getQuantity(productId);
    const newQty = Math.max(1, currentQty + change);

    setQuantities({
      ...quantities,
      [productId]: newQty,
    });
  };

  // Navigate to product detail page
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Prevent navigation to product page

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const quantity = getQuantity(product.id);

    if (onAddToCart) {
      onAddToCart(product, quantity);

      // Show toast notification instead of navigating
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
        duration: 3000,
      });
    } else {
      // Default implementation if no onAddToCart is provided
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart`,
        duration: 3000,
      });
    }

    // Reset quantity after adding to cart
    setQuantities({
      ...quantities,
      [product.id]: 1,
    });
  };

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent navigation to product page

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      // Find the product in the local state
      const productIndex = localProducts.findIndex((p) => p.id === productId);
      if (productIndex === -1) return;

      const product = localProducts[productIndex];
      const isFavorite = product.isFavorite;
      const method = isFavorite ? "DELETE" : "POST";
      const url = `http://localhost:10000/api/favorites/${productId}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        // Update local state immediately
        const updatedProducts = [...localProducts];
        updatedProducts[productIndex] = {
          ...product,
          isFavorite: !isFavorite,
        };
        setLocalProducts(updatedProducts);

        // Call the callback if provided
        if (onFavoriteToggle) {
          onFavoriteToggle(productId, !isFavorite);
        }

        // Show toast notification
        toast({
          title: isFavorite ? "Removed from favorites" : "Added to favorites",
          description: isFavorite
            ? "Product has been removed from your favorites"
            : "Product has been added to your favorites",
          duration: 3000,
        });
      } else {
        throw new Error("Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Set hover state for a product
  const setProductHover = (productId: string, isHovered: boolean) => {
    setHoverStates({
      ...hoverStates,
      [productId]: isHovered,
    });
  };

  // Star rating component
  const StarRating = ({ rating }: { rating?: number }) => {
    if (!rating) return null;
    return (
      <div className="flex items-center mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-white p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            {title}
          </h2>
        )}

        {showFilters && (
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Filter:</span>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category && typeof category === "string"
                      ? category.charAt(0).toUpperCase() + category.slice(1)
                      : "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {currentProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentProducts.map((product) => {
            // Calculate discounted price if applicable
            const hasValidPrice =
              typeof product.price === "number" && !isNaN(product.price);
            const hasValidDiscount =
              typeof product.discount === "number" && !isNaN(product.discount);
            const discountedPrice =
              hasValidPrice && hasValidDiscount && product.discount
                ? product.price * (1 - product.discount / 100)
                : null;
            // Format price as VND
            const formatVND = (value: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value);

            const isHovered =
              hoverStates[product.id] || getQuantity(product.id) > 1;

            return (
              <Card
                key={product.id}
                className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-lg cursor-pointer"
                onClick={() => handleProductClick(product.id)}
                onMouseEnter={() => setProductHover(product.id, true)}
                onMouseLeave={() => setProductHover(product.id, false)}
              >
                <div className="relative" style={{ fontSize: 0 }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* Out of stock badge */}
                  {!product.inStock && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}

                  {/* Discount badge */}
                  {product.discount && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500">
                        {product.discount}% OFF
                      </Badge>
                    </div>
                  )}

                  {/* Wishlist button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full"
                    onClick={(e) => handleWishlist(e, product.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        product.isFavorite
                          ? "text-red-500 fill-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                </div>

                <CardContent className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500 mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-medium text-lg mb-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Star rating */}
                    <StarRating rating={product.rating} />
                  </div>

                  {/* Price */}
                  <div className="mt-4 mb-2">
                    {discountedPrice !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold">
                          {formatVND(discountedPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {hasValidPrice ? formatVND(product.price) : "N/A"}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold">
                        {hasValidPrice ? formatVND(product.price) : "N/A"}
                      </span>
                    )}
                  </div>

                  {/* Add to cart controls */}
                  <div
                    className={`flex items-center justify-between mt-2 transition-opacity duration-200 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Button
                      size="sm"
                      disabled={!product.inStock}
                      onClick={(e) => handleAddToCart(e, product)}
                      style={{ backgroundColor: "#7494ec" }}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductGrid;
