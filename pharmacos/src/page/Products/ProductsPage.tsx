// src/page/products/ProductsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    SelectValue
} from "@/components/ui/select";
import ProductGrid from '../../components/ProductGrid';
import { FilterX, SlidersHorizontal, Search } from 'lucide-react';
import { getFilterState, saveFilterState, FilterState } from '../../utils/homeSessionStorage';
import { useToast } from "@/components/ui/use-toast";

// Categories matching CategoryNav
const categoryOptions = [
    { id: 'all', name: 'All Products' },
    { id: 'facial-skincare', name: 'Facial Skincare' },
    { id: 'body-care', name: 'Body Care' },
    { id: 'skin-solutions', name: 'Skin Solutions' },
    { id: 'hair-care', name: 'Hair & Scalp Care' },
    { id: 'makeup', name: 'Makeup' },
    { id: 'eye-care', name: 'Eye Care' },
    { id: 'natural-products', name: 'Natural Products' },
];

// Dummy product data (in a real app, this would come from an API)
const allProducts = [
    {
        id: "1",
        name: "Vitamin C Serum",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        category: "facial-skincare",
        subcategory: "serum",
        inStock: true,
        tags: ["brightening", "antioxidant"],
        rating: 4.8,
        brand: "The Ordinary",
        discount: 10
    },
    {
        id: "2",
        name: "Gentle Facial Cleanser",
        price: 18.50,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
        category: "facial-skincare",
        subcategory: "cleanser",
        inStock: true,
        tags: ["gentle", "hydrating"],
        rating: 4.6,
        brand: "CeraVe"
    },
    {
        id: "3",
        name: "Hyaluronic Acid Moisturizer",
        price: 32.00,
        image: "https://images.unsplash.com/photo-1611930022073-84f3e05cd886?w=800&q=80",
        category: "facial-skincare",
        subcategory: "moisturizer",
        inStock: true,
        tags: ["hydrating", "plumping"],
        rating: 4.7,
        brand: "Neutrogena"
    },
    {
        id: "4",
        name: "Clay Face Mask",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1614806687404-6e337aa3bcce?w=800&q=80",
        category: "facial-skincare",
        subcategory: "face-mask",
        inStock: true,
        tags: ["purifying", "pore-minimizing"],
        rating: 4.3,
        brand: "Innisfree"
    },
    {
        id: "5",
        name: "Hydrating Body Lotion",
        price: 22.50,
        image: "https://images.unsplash.com/photo-1626765588889-201adcf8e636?w=800&q=80",
        category: "body-care",
        subcategory: "body-lotion",
        inStock: true,
        tags: ["moisturizing", "long-lasting"],
        rating: 4.5,
        brand: "Aveeno"
    },
    {
        id: "6",
        name: "Exfoliating Body Scrub",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
        category: "body-care",
        subcategory: "body-scrub",
        inStock: false,
        tags: ["exfoliating", "smoothing"],
        rating: 4.2,
        brand: "Tree Hut"
    },
    {
        id: "7",
        name: "Anti-Aging Eye Cream",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=800&q=80",
        category: "eye-care",
        subcategory: "eye-cream",
        inStock: true,
        tags: ["anti-aging", "firming"],
        rating: 4.6,
        brand: "RoC",
        discount: 15
    },
    {
        id: "8",
        name: "Volumizing Mascara",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1631214528203-9f9a44e8c668?w=800&q=80",
        category: "makeup",
        subcategory: "mascara",
        inStock: true,
        tags: ["volumizing", "lengthening"],
        rating: 4.4,
        brand: "Maybelline"
    },
    {
        id: "9",
        name: "Matte Lipstick",
        price: 22.00,
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
        category: "makeup",
        subcategory: "lipstick",
        inStock: true,
        tags: ["long-lasting", "matte-finish"],
        rating: 4.5,
        brand: "MAC"
    },
    {
        id: "10",
        name: "Aloe Vera Gel",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1598662957563-ee4965d4d72c?w=800&q=80",
        category: "natural-products",
        subcategory: "aloe-vera",
        inStock: true,
        tags: ["soothing", "cooling"],
        rating: 4.3,
        brand: "Nature Republic"
    },
    {
        id: "11",
        name: "Anti-Dandruff Shampoo",
        price: 16.50,
        image: "https://images.unsplash.com/photo-1585232351009-aa87416fca92?w=800&q=80",
        category: "hair-care",
        subcategory: "shampoo",
        inStock: true,
        tags: ["anti-dandruff", "soothing"],
        rating: 4.2,
        brand: "Head & Shoulders"
    },
    {
        id: "12",
        name: "Hair Growth Serum",
        price: 35.00,
        image: "https://images.unsplash.com/photo-1608247601490-e7c8c151cf11?w=800&q=80",
        category: "hair-care",
        subcategory: "hair-serum",
        inStock: true,
        tags: ["strengthening", "growth-promoting"],
        rating: 4.0,
        brand: "The Ordinary",
        discount: 5
    }
];

// Get all unique brands and tags
const allBrands = [...new Set(allProducts.map(p => p.brand))];
const allTags = [...new Set(allProducts.flatMap(p => p.tags || []))];

const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [inStockOnly, setInStockOnly] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<string>("featured");
    const [filtersVisible, setFiltersVisible] = useState<boolean>(true);

    const [filteredProducts, setFilteredProducts] = useState(allProducts);

    // Calculate min and max prices from products
    const minProductPrice = Math.min(...allProducts.map(p => p.price));
    const maxProductPrice = Math.max(...allProducts.map(p => p.price));

    // Initialize with the min and max product prices
    useEffect(() => {
        setPriceRange([minProductPrice, maxProductPrice]);
    }, [minProductPrice, maxProductPrice]);

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
            if (savedFilterState.inStockOnly !== undefined) {
                setInStockOnly(savedFilterState.inStockOnly);
            }
            // if (savedFilterState.subcategory && savedFilterState.subcategory.trim() !== '') {
            //     setSelectedSubcategory(savedFilterState.subcategory);
            // } else {
            //     setSelectedSubcategory(null);
            // }
        }
    }, []);

    // console.log(getFilterState());

    // Save filter state when any filter changes
    useEffect(() => {
        console.log(selectedSubcategory)
        const filterState: FilterState = {
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            subcategory: selectedSubcategory || undefined,
            searchQuery: searchQuery || undefined,
            sortBy: sortBy !== "featured" ? sortBy : undefined,
            priceRange: priceRange,
            brands: selectedBrands.length > 0 ? selectedBrands : undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            inStockOnly: inStockOnly || undefined
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
        inStockOnly
    ]);

    // Apply filters when any filter changes
    useEffect(() => {
        let filtered = [...allProducts];

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Apply subcategory filter
        if (selectedSubcategory) {
            filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                p =>
                    p.name.toLowerCase().includes(query) ||
                    p.brand?.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        // Apply price filter
        filtered = filtered.filter(
            p => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Apply brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            filtered = filtered.filter(p =>
                p.tags && p.tags.some(tag => selectedTags.includes(tag))
            );
        }

        // Apply in-stock filter
        if (inStockOnly) {
            filtered = filtered.filter(p => p.inStock);
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
        inStockOnly,
        sortBy
    ]);

    // Get subcategories based on selected category
    const getSubcategories = (): string[] => {
        if (selectedCategory === "all") return [];

        // Filter out any empty subcategories
        const categoryProducts = allProducts.filter(p => p.category === selectedCategory);
        return [...new Set(categoryProducts
            .map(p => p.subcategory)
            .filter(subcategory => subcategory && subcategory.trim() !== '')
        )];
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
            setSelectedBrands(selectedBrands.filter(b => b !== brand));
        }
    };

    // Handle tag selection
    const handleTagChange = (tag: string, checked: boolean) => {
        if (checked) {
            setSelectedTags([...selectedTags, tag]);
        } else {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setSelectedCategory("all");
        setSelectedSubcategory(null);
        setSearchQuery("");
        setPriceRange([minProductPrice, maxProductPrice]);
        setSelectedBrands([]);
        setSelectedTags([]);
        setInStockOnly(false);
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
        const category = categoryOptions.find(c => c.id === id);
        return category ? category.name : "All Products";
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{getCategoryName(selectedCategory)}</h1>
                <p className="text-gray-600 mt-2">{filteredProducts.length} products</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className={`md:w-1/4 space-y-6 ${filtersVisible ? 'block' : 'hidden md:block'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Filters</h2>
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm">
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
                                onValueChange={(value) => setSelectedSubcategory(value === "all-subcategories" ? null : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subcategory" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Use a non-empty default value */}
                                    <SelectItem value="all-subcategories">All Subcategories</SelectItem>
                                    {getSubcategories().map((subcategory) => (
                                        // Make sure each subcategory is not an empty string
                                        subcategory && subcategory.trim() !== '' ? (
                                            <SelectItem key={subcategory} value={subcategory}>
                                                {subcategory.replace(/-/g, ' ').split(' ').map(word =>
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </SelectItem>
                                        ) : null
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Price Range Filter */}
                    <div className="space-y-2">
                        <h3 className="font-medium">Price Range</h3>
                        <Slider
                            defaultValue={[minProductPrice, maxProductPrice]}
                            min={minProductPrice}
                            max={maxProductPrice}
                            step={1}
                            value={priceRange}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
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
                                    <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
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
                                    <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                                        {tag.replace('-', ' ')}
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

                        <Select value={sortBy} onValueChange={setSortBy} defaultValue="featured">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="newest">Newest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <ProductGrid
                            products={filteredProducts}
                            onAddToCart={handleAddToCart}
                            showFilters={false}  // Hide filters in the grid since we have them in the sidebar
                        />
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border">
                            <h3 className="text-lg font-medium">No products match your filters</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your filters or browse all products</p>
                            <Button
                                onClick={resetFilters}
                                className="mt-4"
                                style={{ backgroundColor: '#7494ec' }}
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