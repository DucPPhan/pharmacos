import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Clock,
  CreditCard,
  Award,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import AIImageSearch from "../../components/AIImageSearch";
import ProductGrid from "../../components/ProductGrid";
import { useNavigate } from "react-router-dom";
import CategoryNav from "./CategoryNav";
import { motion, AnimatePresence } from "framer-motion";

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
      "https://images.pexels.com/photos/965990/pexels-photo-965990.jpeg?cs=srgb&dl=pexels-valeriya-965990.jpg&fm=jpg",
    count: 43,
  },
  {
    id: 6,
    name: "Natural Products",
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

// Banner data for the slider
const banners = [
  {
    id: 1,
    title: "Premium Skincare Products",
    description:
      "Discover dermatologist-recommended solutions for radiant skin",
    cta: "Shop Skincare",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600&q=80",
    link: "/products",
    color: "from-blue-400/70 to-purple-400/70",
  },
  {
    id: 2,
    title: "Find Products With AI",
    description:
      "Upload a photo of any product and our AI will identify it instantly",
    cta: "Try AI Search",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&q=80",
    link: "/ai-search",
    color: "from-emerald-400/70 to-cyan-400/70",
  },
  {
    id: 3,
    title: "Summer Sale - Up to 40% Off",
    description:
      "Limited time offers on sunscreens, after-sun care, and summer essentials",
    cta: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1532086853747-99450c17fa2e?w=1600&q=80",
    link: "/sale",
    color: "from-amber-400/70 to-orange-400/70",
  },
  {
    id: 4,
    title: "New Arrivals: Natural Collection",
    description: "Eco-friendly formulas with clean, sustainable ingredients",
    cta: "Explore Collection",
    image:
      "https://images.unsplash.com/photo-1626785525676-260c06ee3e32?w=1600&q=80",
    link: "/natural-products",
    color: "from-green-400/70 to-lime-400/70",
  },
];

// Trust badges data
const trustBadges = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Delivery",
    description: "On orders over $50",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Fast Shipping",
    description: "Delivered in 1-3 days",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Easy Returns",
    description: "30-day money back",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Quality Products",
    description: "Verified authenticity",
  },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");
  const [showNavButtons, setShowNavButtons] = useState(true);
  const bannerRef = useRef(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Auto rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!bannerRef.current) return;

      const bannerBottom = bannerRef.current.getBoundingClientRect().bottom;
      // Hide navigation buttons when the banner is scrolled up past a certain point
      setShowNavButtons(bannerBottom > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
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
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="bg-background">
      <CategoryNav />
      <main>
        {/* Banner Slider Section */}
        <section className="relative overflow-hidden">
          <div className="relative h-[400px] md:h-[500px]">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <div
                  className={`h-full bg-gradient-to-r ${banners[currentBanner].color} relative`}
                >
                  <div className="absolute inset-0">
                    <img
                      src={banners[currentBanner].image}
                      alt={banners[currentBanner].title}
                      className="w-full h-full object-cover opacity-85 mix-blend-overlay"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative h-full container mx-auto px-4 flex items-center">
                    <div className="max-w-lg text-white">
                      <motion.h1
                        className="text-4xl md:text-5xl font-bold mb-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {banners[currentBanner].title}
                      </motion.h1>
                      <motion.p
                        className="text-lg mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {banners[currentBanner].description}
                      </motion.p>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button
                          size="lg"
                          style={{ backgroundColor: "#7494ec" }}
                          onClick={() => navigate(banners[currentBanner].link)}
                        >
                          {banners[currentBanner].cta}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Banner Navigation Arrows */}
            {showNavButtons && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm text-white transition-all z-auto"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm text-white transition-all z-auto"
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Banner Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-auto">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBanner(index)}
                      className={`h-2 w-10 rounded-full transition-all ${
                        currentBanner === index ? "bg-white" : "bg-white/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 transition-transform hover:scale-105"
                >
                  <div className="text-primary mb-3 bg-primary/10 p-3 rounded-full">
                    {badge.icon}
                  </div>
                  <h3 className="font-medium text-sm md:text-base">
                    {badge.title}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm">
                    {badge.description}
                  </p>
                </div>
              ))}
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
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="categories">Browse Categories</TabsTrigger>
                <TabsTrigger value="featured">Featured Products</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <Link to={`/category/${category.id}`} key={category.id}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="relative h-48">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 flex items-end">
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
                {loadingProducts ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <ProductGrid
                    products={apiProducts.map((p) => {
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
                        rating: p.aiFeatures?.recommendationScore
                          ? parseFloat(p.aiFeatures.recommendationScore)
                          : undefined,
                      };
                    })}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link
                to="/products"
                className="text-primary hover:underline hover:text-blue-400"
              >
                View All
              </Link>
            </div>
            {loadingProducts ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ProductGrid
                products={apiProducts.map((p) => {
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
                    rating: p.aiFeatures?.recommendationScore
                      ? parseFloat(p.aiFeatures.recommendationScore)
                      : undefined,
                  };
                })}
              />
            )}
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
                  <Button style={{ backgroundColor: "#7494ec" }}>
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">
              What Our Customers Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Emily Johnson",
                  role: "Skincare Enthusiast",
                  image: "https://randomuser.me/api/portraits/women/44.jpg",
                  quote:
                    "The products are amazing! My skin has never looked better. The customer service team was also very helpful.",
                  rating: 5,
                },
                {
                  name: "Michael Chen",
                  role: "Loyal Customer",
                  image: "https://randomuser.me/api/portraits/men/32.jpg",
                  quote:
                    "I've been using PharmaCoS for all my healthcare needs. Their fast delivery and quality products keep me coming back.",
                  rating: 5,
                },
                {
                  name: "Sarah Williams",
                  role: "Beauty Blogger",
                  image: "https://randomuser.me/api/portraits/women/68.jpg",
                  quote:
                    "As a beauty blogger, I've tried countless products, but the range at PharmaCoS stands out for its effectiveness and value.",
                  rating: 4,
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-lg shadow-sm"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// Star icon for ratings
const Star = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default Home;
