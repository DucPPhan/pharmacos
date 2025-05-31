import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import AIImageSearch from "./AIImageSearch";
import ProductGrid from "./ProductGrid";
import { useNavigate } from "react-router-dom";
import CategoryNav from "./CategoryNav";

const categories = [
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

const featuredProducts = [
  {
    id: "1",
    name: "Vitamin C Serum",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    category: "Skincare",
    inStock: true,
  },
  {
    id: "2",
    name: "Hydrating Face Cream",
    price: 32.5,
    image:
      "https://images.unsplash.com/photo-1611930022073-84f3e05cd886?w=800&q=80",
    category: "Skincare",
    inStock: true,
  },
  {
    id: "3",
    name: "Pain Relief Tablets",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80",
    category: "Pharmaceuticals",
    inStock: false,
  },
  {
    id: "4",
    name: "Sunscreen SPF 50",
    price: 18.75,
    image:
      "https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=800&q=80",
    category: "Skincare",
    inStock: true,
  },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  return (
    <div className=" bg-background">
      <CategoryNav/>
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Find Your Products Instantly
                </h1>
                <p className="text-lg mb-6">
                  Upload a photo of any product and our AI will identify it for
                  you.
                </p>
                <Button className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Try Image Search
                </Button>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
                  alt="AI Product Recognition"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Search Options */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Find Products Your Way
            </h2>

            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="categories">Browse Categories</TabsTrigger>
                <TabsTrigger value="featured">Featured Products</TabsTrigger>
                <TabsTrigger value="ai-search">AI Image Search</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <Link to={`/category/${category.id}`} key={category.id}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-end">
                            <div className="p-4 text-white w-full">
                              <h3 className="text-xl font-semibold">
                                {category.name}
                              </h3>
                              <p className="text-sm">
                                {category.count} products
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="featured">
                <ProductGrid products={featuredProducts} />
              </TabsContent>

              <TabsContent value="ai-search">
                <AIImageSearch />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products" className="text-primary hover:underline">
                View All
              </Link>
            </div>

            <ProductGrid products={featuredProducts} />
          </div>
        </section>

        {/* Promotion Banner */}
        <section className="py-12 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2">
                  <img
                    src="https://images.unsplash.com/photo-1607703703674-df96941cad76?w=800&q=80"
                    alt="Special Offer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-4">Special Offer</h2>
                  <p className="text-lg mb-6">
                    Get 20% off on all skincare products this week. Use code
                    SKIN20 at checkout.
                  </p>
                  <Button>Shop Now</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
