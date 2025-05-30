import React, { useState } from "react";
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
import { ShoppingCart, Heart, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

interface ProductGridProps {
  products?: Product[];
  title?: string;
  showFilters?: boolean;
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
    },
    {
      id: "2",
      name: "Pain Relief Tablets",
      price: 12.5,
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
      category: "Medication",
      inStock: true,
    },
    {
      id: "3",
      name: "Hydrating Face Cream",
      price: 32.99,
      image:
        "https://images.unsplash.com/photo-1593642634402-b0eb5e2eebc9?w=400&q=80",
      category: "Skincare",
      inStock: true,
    },
    {
      id: "4",
      name: "Allergy Relief Spray",
      price: 18.75,
      image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80",
      category: "Medication",
      inStock: false,
    },
    {
      id: "5",
      name: "Collagen Supplement",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
      category: "Supplements",
      inStock: true,
    },
    {
      id: "6",
      name: "Anti-Aging Eye Cream",
      price: 45.0,
      image:
        "https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&q=80",
      category: "Skincare",
      inStock: true,
    },
  ],
  title = "Featured Products",
  showFilters = true,
}: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) =>
            product.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0; // default sorting
  });

  // Get unique categories
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
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
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  const handleAddToCart = (productId: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    console.log(`Added product ${productId} to cart`);
  };

  const handleWishlist = (productId: string) => {
    // Placeholder for wishlist functionality
    console.log(`Added product ${productId} to wishlist`);
  };

  return (
    <div className="w-full bg-white p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          {title}
        </h2>

        {showFilters && (
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
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
                      {category && typeof category === "string"
                        ? category.charAt(0).toUpperCase() + category.slice(1)
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
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
          {currentProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                {!product.inStock && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full"
                  onClick={() => handleWishlist(product.id)}
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                  <p className="text-sm text-gray-500 mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
