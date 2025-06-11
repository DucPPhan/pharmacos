// src/page/products/ProductsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "../../utils/homeSessionStorage";
import { useToast } from "@/components/ui/use-toast";

// Categories matching CategoryNav
const categoryOptions = [
  { id: "all", name: "All Products" },
  { id: "facial-skincare", name: "Facial Skincare" },
  { id: "body-care", name: "Body Care" },
  { id: "skin-solutions", name: "Skin Solutions" },
  { id: "hair-care", name: "Hair & Scalp Care" },
  { id: "makeup", name: "Makeup" },
  { id: "eye-care", name: "Eye Care" },
  { id: "natural-products", name: "Natural Products" },
];

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [filtersVisible, setFiltersVisible] = useState<boolean>(true);

  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Load filter state from session storage on component mount
  useEffect(() => {
    const savedFilterState = getFilterState();

    if (savedFilterState) {
      if (savedFilterState.category) {
        setSelectedCategory(savedFilterState.category);
      }
      if (savedFilterState.subcategory) {
        setSelectedSubcategory(savedFilterState.subcategory);
      }
      if (savedFilterState.searchQuery) {
        setSearchQuery(savedFilterState.searchQuery);
      }
      if (savedFilterState.sortBy) {
        setSortBy(savedFilterState.sortBy);
      }
      if (savedFilterState.priceRange) {
        setPriceRange(savedFilterState.priceRange);
      }
      if (savedFilterState.brands && savedFilterState.brands.length > 0) {
        setSelectedBrands(savedFilterState.brands);
      }
      if (savedFilterState.tags && savedFilterState.tags.length > 0) {
        setSelectedTags(savedFilterState.tags);
      }
    }
  }, []);

  // console.log(getFilterState());

  // Save filter state when any filter changes
  useEffect(() => {
    console.log(selectedSubcategory);
    const filterState: FilterState = {
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      subcategory: selectedSubcategory || undefined,
      searchQuery: searchQuery || undefined,
      sortBy: sortBy !== "featured" ? sortBy : undefined,
      priceRange: priceRange,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };

    saveFilterState(filterState);
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    sortBy,
    priceRange,
    selectedBrands,
    selectedTags,
  ]);

  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...apiProducts];

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Apply subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Apply price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(
        (p) =>
          Array.isArray(p.brand) &&
          p.brand.some((b) => selectedBrands.includes(b))
      );
    }

    // Apply tag filter (Product Features)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(
        (p) =>
          Array.isArray(p.features) &&
          p.features.some((f) => selectedTags.includes(f))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low-high":
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        // In a real app, you would sort by date added
        // For now, we'll just use the reversed array
        filtered = [...filtered].reverse();
        break;
      // Default "featured" uses original order
    }

    setFilteredProducts(filtered);
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    priceRange,
    selectedBrands,
    selectedTags,
    sortBy,
    apiProducts,
  ]);

  // Get subcategories based on selected category
  const getSubcategories = (): string[] => {
    if (selectedCategory === "all") return [];

    // Filter out any empty subcategories
    const categoryProducts = apiProducts.filter(
      (p) => p.category === selectedCategory
    );
    return [
      ...new Set(
        categoryProducts
          .map((p) => p.subcategory)
          .filter((subcategory) => subcategory && subcategory.trim() !== "")
      ),
    ];
  };

  // Handle search
  const handleSearch = () => {
    // This function is called when the search button is clicked
    // We're already updating the filteredProducts in the useEffect
    toast({
      title: "Search results",
      description: `Found ${filteredProducts.length} products matching your criteria`,
      duration: 3000,
    });
  };

  // Handle brand selection
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    }
  };

  // Handle tag selection
  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory(null);
    setSearchQuery("");
    setPriceRange([priceRange[0], priceRange[1]]);
    setSelectedBrands([]);
    setSelectedTags([]);
    setSortBy("featured");
  };

  // Handle add to cart
  const handleAddToCart = (product, quantity) => {
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
      duration: 3000,
    });
  };

  // Get category name for display
  const getCategoryName = (id: string): string => {
    const category = categoryOptions.find((c) => c.id === id);
    return category ? category.name : "All Products";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:10000/api/products", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setApiProducts(
          Array.isArray(data?.data?.products) ? data.data.products : []
        );
      } catch {
        setApiProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // After fetching products, set priceRange, filteredProducts, allBrands, and allTags
  useEffect(() => {
    if (apiProducts.length > 0) {
      const min = Math.min(...apiProducts.map((p) => p.price));
      const max = Math.max(...apiProducts.map((p) => p.price));
      setPriceRange([min, max]);
      setFilteredProducts(apiProducts);
      // Lấy tất cả brand duy nhất từ mảng brand
      const brands = Array.from(
        new Set(
          apiProducts.flatMap((p) =>
            Array.isArray(p.brand)
              ? p.brand
                  .map((b) => (typeof b === "string" ? b.trim() : ""))
                  .filter(Boolean)
              : []
          )
        )
      );
      setAllBrands(brands);
      // Lấy tất cả feature duy nhất từ mảng features
      const features = Array.from(
        new Set(
          apiProducts.flatMap((p) =>
            Array.isArray(p.features)
              ? p.features
                  .map((f) => (typeof f === "string" ? f.trim() : ""))
                  .filter(Boolean)
              : []
          )
        )
      );
      setAllTags(features);
    }
  }, [apiProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {getCategoryName(selectedCategory)}
        </h1>
        <p className="text-gray-600 mt-2">{filteredProducts.length} products</p>
      </div>

      {/* Search and Filters */}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
              <Button size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Category</h3>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory Filter (only show if a category is selected) */}
          {selectedCategory !== "all" && getSubcategories().length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Subcategory</h3>
              <Select
                value={selectedSubcategory || "all-subcategories"}
                onValueChange={(value) =>
                  setSelectedSubcategory(
                    value === "all-subcategories" ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {/* Use a non-empty default value */}
                  <SelectItem value="all-subcategories">
                    All Subcategories
                  </SelectItem>
                  {getSubcategories().map((subcategory) =>
                    // Make sure each subcategory is not an empty string
                    subcategory && subcategory.trim() !== "" ? (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory
                          .replace(/-/g, " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Price Range</h3>
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              min={priceRange[0]}
              max={priceRange[1]}
              step={1}
              value={priceRange}
              onValueChange={(value) =>
                setPriceRange(value as [number, number])
              }
              className="my-6"
            />
            <div className="flex justify-between text-sm">
              <span>${priceRange[0].toFixed(2)}</span>
              <span>${priceRange[1].toFixed(2)}</span>
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
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={(checked) =>
                      handleBrandChange(brand, checked as boolean)
                    }
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
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={(checked) =>
                      handleTagChange(tag, checked as boolean)
                    }
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
              value={sortBy}
              onValueChange={setSortBy}
              defaultValue="featured"
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
                  const primary = p.images.find((img) => img.isPrimary);
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
                    p.reviews && p.reviews.length > 0
                      ? p.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                        p.reviews.length
                      : undefined,
                  brand: p.brand,
                };
              })}
              onAddToCart={handleAddToCart}
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
