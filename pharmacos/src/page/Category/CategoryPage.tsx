// src/page/category/CategoryPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Slider } from "../../components/ui/slider";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import ProductGrid from "../../components/ProductGrid";
import { FilterX, SlidersHorizontal } from "lucide-react";
import { saveFilterState } from "@/utils/homeSessionStorage";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  categoryId: number;
  inStock: boolean;
  tags?: string[];
  rating?: number;
  brand?: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
  count: number;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Pharmaceuticals",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    count: 120,
  },
  {
    id: 2,
    name: "Skincare",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    count: 85,
  },
  {
    id: 3,
    name: "Haircare",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    count: 64,
  },
  {
    id: 4,
    name: "Makeup",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    count: 92,
  },
  {
    id: 5,
    name: "Fragrances",
    image:
      "https://images.unsplash.com/photo-1615412704911-55d589229864?w=800&q=80",
    count: 43,
  },
  {
    id: 6,
    name: "Personal Care",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
    count: 76,
  },
];

const CategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [apiProducts, setApiProducts] = useState<any[]>([]);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [filtersVisible, setFiltersVisible] = useState<boolean>(true);
  const [showSortingSelect, setShowSortingSelect] = useState(false);

  // Calculate min and max prices from products
  const minProductPrice = Math.min(...apiProducts.map((p) => p.price));
  const maxProductPrice = Math.max(...apiProducts.map((p) => p.price));

  // Initialize with the min and max product prices
  useEffect(() => {
    setPriceRange([minProductPrice, maxProductPrice]);
  }, [minProductPrice, maxProductPrice]);

  // Load category and products when component mounts or categoryId changes
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

  useEffect(() => {
    const categoryIdNum = parseInt(categoryId || "0", 10);
    const foundCategory = categories.find((c) => c.id === categoryIdNum);
    if (foundCategory) {
      setCategory(foundCategory);
      // Lọc sản phẩm theo category
      const categoryProducts = apiProducts.filter(
        (p) => p.category === foundCategory.name
      );
      setProducts(
        categoryProducts.map((p: any) => {
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
            categoryId: categoryIdNum,
            inStock: p.stockQuantity > 0,
            tags: p.features,
            rating:
              p.reviews && p.reviews.length > 0
                ? p.reviews.reduce(
                    (acc: number, r: any) => acc + (r.rating || 0),
                    0
                  ) / p.reviews.length
                : undefined,
            brand: p.brand,
          };
        })
      );
      setFilteredProducts(categoryProducts);
    }
  }, [categoryId, apiProducts]);

  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...products];

    // Apply price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply brand filter if any brands are selected
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(
        (p) => p.brand && selectedBrands.includes(p.brand)
      );
    }

    // Apply tag filter if any tags are selected
    if (selectedTags.length > 0) {
      filtered = filtered.filter(
        (p) => p.tags && p.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    // Apply in-stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
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
      // Default "featured" uses original order
    }

    setFilteredProducts(filtered);
  }, [products, priceRange, selectedBrands, selectedTags, inStockOnly, sortBy]);

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
    setPriceRange([minProductPrice, maxProductPrice]);
    setSelectedBrands([]);
    setSelectedTags([]);
    setInStockOnly(false);
    setSortBy("featured");
  };

  // Define allBrands and allTags from apiProducts
  const allBrands = Array.from(
    new Set(apiProducts.map((p: any) => p.brand).filter(Boolean))
  );
  const allTags = Array.from(
    new Set(apiProducts.flatMap((p: any) => p.features || []))
  );

  if (!category) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const handleViewAll = () => {
    saveFilterState({
      category: categoryId,
    });
    navigate("/products");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-gray-600">{filteredProducts.length} products</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <Button onClick={handleViewAll}>View All Products</Button>
            </div>
            {showSortingSelect && (
              <div className="w-48">
                <Select onValueChange={setSortBy} value={sortBy}>
                  <SelectTrigger>
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
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setFiltersVisible(!filtersVisible)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Hero image for the category */}
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-xl md:text-2xl font-bold">
                Explore {category.name}
              </h2>
              <p>Quality products for your needs</p>
            </div>
          </div>
        </div>
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

          {/* Price Range Filter */}
          <div className="space-y-2">
            <h3 className="font-medium">Price Range</h3>
            <Slider
              defaultValue={[minProductPrice, maxProductPrice]}
              min={minProductPrice}
              max={maxProductPrice}
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

          {/* In Stock Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:w-3/4">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-12">
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

export default CategoryPage;
