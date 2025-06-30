// src/page/products/ProductsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductGrid from "../../components/ProductGrid";
import { FilterX, SlidersHorizontal, Search } from "lucide-react";
import {
  getFilterState,
  saveFilterState,
  FilterState,
  clearFilterState,
} from "../../utils/homeSessionStorage";
import { useToast } from "@/components/ui/use-toast";
import { staffApi } from "../staff/services/api";
import { useCart } from "@/contexts/CartContext";

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const isInitialMount = useRef(true);

  // Filter states from URL or session storage
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilterState = getFilterState();
    return (
      savedFilterState || {
        category: "all",
        subcategory: null,
        priceRange: [0, 100],
        selectedBrands: [],
        selectedTags: [],
        sortBy: "featured",
        searchQuery: "",
      }
    );
  });

  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([{ id: "all", name: "All Products" }]);
  const [priceConfig, setPriceConfig] = useState({ min: 0, max: 1000 });
  const [filtersVisible, setFiltersVisible] = useState<boolean>(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // Single effect to update filters and save to session storage
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    saveFilterState(updated);
  };

  // Fetch products and populate filter options
  useEffect(() => {
    const fetchAndSetup = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:10000/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const products = Array.isArray(data?.data?.products)
          ? data.data.products
          : [];
        setApiProducts(products);

        // Fetch favorites if user is logged in
        if (token) {
          try {
            const favRes = await fetch("http://localhost:10000/api/favorites", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (favRes.ok) {
              const favData = await favRes.json();
              // Extract product IDs from favorites data
              const favoriteIds = favData.data.map(
                (fav) => fav.product._id || fav.product.id
              );
              setUserFavorites(favoriteIds);
            }
          } catch (error) {
            console.error("Error fetching favorites:", error);
          }
        }

        if (products.length > 0) {
          // Setup filter options once
          const min = Math.min(...products.map((p) => p.price));
          const max = Math.max(...products.map((p) => p.price));
          setPriceConfig({ min, max });

          // If no price range is set in filters, set it from products
          if (
            !filters.priceRange ||
            (filters.priceRange[0] === 0 && filters.priceRange[1] === 100)
          ) {
            updateFilters({ priceRange: [min, max] });
          }

          const brands = Array.from(
            new Set(products.flatMap((p) => p.brand || []).filter(Boolean))
          ) as string[];
          setAllBrands(brands);

          const features = Array.from(
            new Set(products.flatMap((p) => p.features || []).filter(Boolean))
          ) as string[];
          setAllTags(features);

          const categories = Array.from(
            new Set(products.map((p) => p.category).filter(Boolean))
          ).map((cat) => ({ id: cat as string, name: cat as string }));
          setAllCategories([
            { id: "all", name: "All Products" },
            ...categories,
          ]);
        }
      } catch {
        setApiProducts([]);
      }
    };
    fetchAndSetup();
  }, []); // Runs only once on mount

  // Main filtering logic
  useEffect(() => {
    let filtered = [...apiProducts];
    // Mark favorite products
    filtered = filtered.map((product) => ({
      ...product,
      isFavorite: userFavorites.includes(product._id),
    }));

    const {
      category,
      subcategory,
      searchQuery,
      priceRange,
      brands,
      tags,
      sortBy,
    } = filters;

    if (category && category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory === subcategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand?.some((b: string) => b.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query) ||
          p.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    if (priceRange) {
      filtered = filtered.filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );
    }
    if (brands && brands.length > 0) {
      filtered = filtered.filter((p) =>
        p.brand?.some((b: string) => brands.includes(b))
      );
    }
    if (tags && tags.length > 0) {
      filtered = filtered.filter((p) =>
        p.features?.some((f: string) => tags.includes(f))
      );
    }

    switch (sortBy) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.reverse();
        break;
    }

    setFilteredProducts(filtered);

    // This is to clear the session storage once navigation is complete and filters applied
    if (isInitialMount.current) {
      clearFilterState();
      isInitialMount.current = false;
    }
  }, [filters, apiProducts, userFavorites]);

  // Get subcategories based on selected category
  const getSubcategories = (): string[] => {
    if (!filters.category || filters.category === "all") return [];
    const categoryProducts = apiProducts.filter(
      (p) => p.category === filters.category
    );
    return [
      ...new Set(categoryProducts.map((p) => p.subcategory).filter(Boolean)),
    ];
  };

  // Reset all filters
  const resetFilters = () => {
    const newFilters: FilterState = {
      category: "all",
      subcategory: null,
      searchQuery: "",
      priceRange: [priceConfig.min, priceConfig.max],
      brands: [],
      tags: [],
      sortBy: "featured",
    };
    updateFilters(newFilters);
  };

  // ... (handleAddToCart and getCategoryName functions remain the same)
  const getCategoryName = (id: string): string => {
    return id ? id : "All Products";
  };
  const handleAddToCart = (product, quantity) => {
    // Add the product to the cart context
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.discount
          ? product.price * (1 - product.discount / 100)
          : product.price,
        image: product.image,
      },
      quantity
    );

    // Show a toast notification
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      duration: 3000,
    });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (productId: string, isFavorite: boolean) => {
    if (isFavorite) {
      // Add to favorites
      setUserFavorites((prev) => [...prev, productId]);
    } else {
      // Remove from favorites
      setUserFavorites((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {getCategoryName(filters.category || "all")}
        </h1>
        <p className="text-gray-600 mt-2">{filteredProducts.length} products</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div
          className={`md:w-1/4 space-y-6 ${
            filtersVisible ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-sm"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <h3 className="font-medium">Search</h3>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.searchQuery || ""}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                className="flex-grow"
              />
              <Button size="icon" onClick={() => updateFilters({})}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Category</h3>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                updateFilters({ category: value, subcategory: null })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Filter */}
          {filters.category &&
            filters.category !== "all" &&
            getSubcategories().length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Subcategory</h3>
                <Select
                  value={filters.subcategory || "all-subcategories"}
                  onValueChange={(value) =>
                    updateFilters({
                      subcategory: value === "all-subcategories" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-subcategories">
                      All Subcategories
                    </SelectItem>
                    {getSubcategories().map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub
                          .replace(/-/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Price Range</h3>
            <Slider
              min={priceConfig.min}
              max={priceConfig.max}
              step={1}
              value={filters.priceRange || [priceConfig.min, priceConfig.max]}
              onValueChange={(value) =>
                updateFilters({ priceRange: value as [number, number] })
              }
              className="my-6"
            />
            <div className="flex justify-between text-sm">
              <span>${(filters.priceRange || [0])[0].toFixed(2)}</span>
              <span>${(filters.priceRange || [0, 0])[1].toFixed(2)}</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allBrands.map((brand) => (
                <div className="flex items-center space-x-2" key={brand}>
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands?.includes(brand)}
                    onCheckedChange={(checked) => {
                      const newBrands = checked
                        ? [...(filters.brands || []), brand]
                        : (filters.brands || []).filter((b) => b !== brand);
                      updateFilters({ brands: newBrands });
                    }}
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Product Features</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allTags.map((tag) => (
                <div className="flex items-center space-x-2" key={tag}>
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags?.includes(tag)}
                    onCheckedChange={(checked) => {
                      const newTags = checked
                        ? [...(filters.tags || []), tag]
                        : (filters.tags || []).filter((t) => t !== tag);
                      updateFilters({ tags: newTags });
                    }}
                  />
                  <Label
                    htmlFor={`tag-${tag}`}
                    className="text-sm cursor-pointer"
                  >
                    {tag.replace("-", " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {filtersVisible ? "Hide Filters" : "Show Filters"}
            </Button>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low-high">
                  Price: Low to High
                </SelectItem>
                <SelectItem value="price-high-low">
                  Price: High to Low
                </SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts.map((p) => {
                let image = "";
                if (Array.isArray(p.images) && p.images.length > 0) {
                  const primary = p.images.find((img: any) => img.isPrimary);
                  image = primary ? primary.url : p.images[0].url;
                }
                return {
                  id: p._id || p.id,
                  name: p.name,
                  price: p.price,
                  image,
                  category: p.category,
                  inStock: p.stockQuantity > 0,
                  rating:
                    p.reviews?.reduce(
                      (acc: number, r: any) => acc + (r.rating || 0),
                      0
                    ) / (p.reviews?.length || 1),
                  brand: p.brand,
                  isFavorite: userFavorites.includes(p._id),
                };
              })}
              onAddToCart={handleAddToCart}
              onFavoriteToggle={handleFavoriteToggle}
              showFilters={false}
            />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <h3 className="text-lg font-medium">
                No products match your filters
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters or browse all products
              </p>
              <Button
                onClick={resetFilters}
                className="mt-4"
                style={{ backgroundColor: "#7494ec" }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
