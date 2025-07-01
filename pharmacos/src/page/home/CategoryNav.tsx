import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import "./CategoryNav.css";
import { motion, AnimatePresence } from "framer-motion";
import { saveFilterState } from "@/utils/homeSessionStorage";

type CategoryItem = {
  id: string; // Keep id for keys, can be same as name
  name: string;
  subcategories: {
    title: string;
    items: string[];
  }[];
  popularProducts: {
    id: string;
    name: string;
    image: string;
  }[];
};

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:10000/api/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        const products = Array.isArray(data?.data?.products)
          ? data.data.products
          : [];

        if (products.length > 0) {
          const categoryMap = new Map<
            string,
            { subcategories: Set<string>; popularProducts: any[] }
          >();

          for (const product of products) {
            const { category, subcategory, isPopular, name, images, _id } =
              product;

            if (!category) continue;

            if (!categoryMap.has(category)) {
              categoryMap.set(category, {
                subcategories: new Set(),
                popularProducts: [],
              });
            }

            const categoryData = categoryMap.get(category)!;

            if (subcategory && subcategory.trim() !== "") {
              categoryData.subcategories.add(subcategory.trim());
            }

            if (isPopular && categoryData.popularProducts.length < 2) {
              const primaryImage =
                images.find((img: any) => img.isPrimary) || images[0];
              categoryData.popularProducts.push({
                id: _id,
                name: name,
                image: primaryImage?.url || "", // Provide a fallback
              });
            }
          }

          const formattedCategories: CategoryItem[] = Array.from(
            categoryMap.entries()
          ).map(([name, data]) => ({
            id: name, // Use name as ID for simplicity
            name: name,
            subcategories:
              data.subcategories.size > 0
                ? [
                    {
                      title: "Types", // Generic title
                      items: Array.from(data.subcategories),
                    },
                  ]
                : [],
            popularProducts: data.popularProducts,
          }));

          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (navRef.current) {
      const height = navRef.current.offsetHeight;
      document.documentElement.style.setProperty(
        "--category-nav-height",
        `${height}px`
      );
    }
  }, []);

  useEffect(() => {
    const classList = document.body.classList;
    if (activeCategory) {
      document.body.classList.add("dropdown-active");
      classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("dropdown-active");
      classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("dropdown-active");
      classList.remove("overflow-hidden");
    };
  }, [activeCategory]);

  const handleCategoryClick = (category: string, subcategory?: string) => {
    saveFilterState({
      category: category,
      subcategory: subcategory,
    });
    navigate("/products");
  };

  const handleMouseEnter = (categoryName: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(categoryName);
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownVisible(false);
      setActiveCategory(null);
    }, 200);
  };

  return (
    <>
      {activeCategory && (
        <div
          className="fixed inset-0 bg-black/40 z-40 pointer-events-none transition-opacity duration-300 ease-in-out"
          style={{
            top: "calc(var(--category-nav-height) + 9%)",
            opacity: activeCategory ? 1 : 0,
          }}
        />
      )}

      <div ref={navRef} className="bg-white border-b z-[100]">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between text-sm md:text-base overflow-x-auto gap-3 md:gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.name)}
                onMouseLeave={handleMouseLeave}
              >
                <li className="relative flex-shrink-0">
                  <div className="cursor-pointer hover:bg-gray-50 rounded-md md:px-3 md:py-3">
                    <div className="flex items-center gap-1 whitespace-nowrap group">
                      <span
                        className={`transition-colors ${
                          activeCategory === category.name
                            ? "text-[#7494ec]"
                            : "hover:text-[#7494ec]"
                        }`}
                      >
                        {category.name}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          activeCategory === category.name
                            ? "text-[#7494ec] rotate-180"
                            : "group-hover:text-[#7494ec]"
                        }`}
                      />
                      <div
                        className={`absolute bottom-1 left-3 right-3 h-0.5 bg-[#7494ec] transform transition-transform duration-300 ${
                          activeCategory === category.name
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </div>
                  </div>
                </li>

                {/* Dropdown */}
                <AnimatePresence>
                  {activeCategory === category.name && dropdownVisible && (
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="fixed left-0 right-0 bg-white shadow-xl border-t z-50"
                      style={{
                        top: "calc(9% + var(--category-nav-height))",
                        maxHeight: "calc(100vh - var(--category-nav-height))",
                        overflowY: "auto",
                      }}
                    >
                      <div className="container mx-auto px-4 py-6">
                        {(() => {
                          const cat = categories.find(
                            (c) => c.name === activeCategory
                          );
                          if (!cat) return null;

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {cat.subcategories.map((subcategory, idx) => (
                                  <div key={idx} className="space-y-3">
                                    <h3 className="font-medium text-gray-900 text-lg border-b pb-2">
                                      {subcategory.title}
                                    </h3>
                                    <ul className="space-y-2">
                                      {subcategory.items.map(
                                        (item, itemIdx) => (
                                          <li key={itemIdx}>
                                            <Link
                                              to="/products"
                                              onClick={() =>
                                                handleCategoryClick(
                                                  cat.name,
                                                  item
                                                )
                                              }
                                              className="text-gray-600 hover:text-primary hover:underline"
                                            >
                                              {item}
                                            </Link>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              {/* Popular Products */}
                              {cat.popularProducts.length > 0 && (
                                <div className="md:col-span-1">
                                  <h3 className="font-medium text-gray-900 text-lg border-b pb-2 mb-3">
                                    Best seller
                                  </h3>
                                  <div className="space-y-4">
                                    {cat.popularProducts.map((product) => (
                                      <Link
                                        to={`/product/${product.id}`}
                                        key={product.id}
                                        className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
                                      >
                                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <span className="text-sm font-medium">
                                          {product.name}
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
