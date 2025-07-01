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
    price: number;
  }[];
};

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<any[]>([]);

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
        setAllProducts(products);

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
                image: primaryImage?.url || "",
                price: product.price,
              });
            }
          }

          const formattedCategories: CategoryItem[] = Array.from(
            categoryMap.entries()
          ).map(([name, data]) => ({
            id: name,
            name: name,
            subcategories:
              data.subcategories.size > 0
                ? [
                    {
                      title: "Types",
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
    setTimeout(() => {
      if (navRef.current) {
        const navHeight = navRef.current.offsetHeight;
        const header = document.querySelector(".main-header");
        const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;
        document.documentElement.style.setProperty(
          "--category-nav-height",
          `${navHeight}px`
        );
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );
      }
    }, 200);
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
                      className="fixed left-0 right-0 bg-white shadow-xl border-t z-[100]"
                      style={{
                        top: `calc(var(--header-height) + var(--category-nav-height))`,
                        maxHeight: `calc(100vh - var(--header-height) - var(--category-nav-height))`,
                        overflowY: "auto",
                      }}
                    >
                      <div className="container mx-auto px-4 py-6">
                        {(() => {
                          const cat = categories.find(
                            (c) => c.name === activeCategory
                          );
                          if (!cat) return null;

                          const catProducts = allProducts.filter(
                            (p) => p.category === cat.name
                          );
                          const productCount = catProducts.length;
                          const minPrice =
                            catProducts.length > 0
                              ? Math.min(...catProducts.map((p) => p.price))
                              : null;
                          const maxPrice =
                            catProducts.length > 0
                              ? Math.max(...catProducts.map((p) => p.price))
                              : null;

                          let featured =
                            cat.popularProducts &&
                            cat.popularProducts.length > 0
                              ? cat.popularProducts.slice(0, 2)
                              : catProducts.slice(0, 2).map((p) => ({
                                  id: p._id,
                                  name: p.name,
                                  image:
                                    p.images && p.images.length > 0
                                      ? p.images.find(
                                          (img: any) => img.isPrimary
                                        )?.url || p.images[0].url
                                      : "",
                                  price: p.price,
                                }));

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              <div className="col-span-1 flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border h-full min-w-[220px]">
                                <div>
                                  <h2 className="text-xl font-bold text-[#7494ec] flex items-center gap-2">
                                    {cat.name}
                                  </h2>
                                  <div className="text-gray-600 text-sm mt-1">
                                    {productCount} sản phẩm
                                  </div>
                                  {minPrice !== null && maxPrice !== null && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Giá:{" "}
                                      {minPrice === maxPrice
                                        ? `${minPrice}₫`
                                        : `${minPrice}₫ - ${maxPrice}₫`}
                                    </div>
                                  )}
                                </div>
                                <Link
                                  to="/products"
                                  onClick={() => handleCategoryClick(cat.name)}
                                  className="mt-2 inline-block px-4 py-2 bg-[#7494ec] text-white rounded hover:bg-[#5a7ad1] text-center text-sm font-medium shadow"
                                >
                                  Xem tất cả sản phẩm
                                </Link>
                              </div>
                              {cat.subcategories.length > 0 && (
                                <div className="col-span-1 flex flex-col gap-2 p-4">
                                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                    Types
                                  </h3>
                                  <ul className="space-y-2">
                                    {cat.subcategories[0].items.map(
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
                                            className="text-gray-700 hover:text-[#7494ec] hover:underline text-base"
                                          >
                                            {item}
                                          </Link>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                              <div className="col-span-2 flex flex-col gap-4 p-4">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                  Sản phẩm nổi bật
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {featured.length > 0 ? (
                                    featured.map((product) => (
                                      <Link
                                        to={`/product/${product.id}`}
                                        key={product.id}
                                        className="flex items-center gap-4 bg-white border rounded-lg p-3 hover:shadow-md transition"
                                      >
                                        <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                          <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium text-base truncate">
                                            {product.name}
                                          </div>
                                          <div className="text-[#7494ec] font-bold mt-1">
                                            {product.price?.toLocaleString()}₫
                                          </div>
                                        </div>
                                      </Link>
                                    ))
                                  ) : (
                                    <div className="text-gray-400 italic">
                                      Chưa có sản phẩm nổi bật
                                    </div>
                                  )}
                                </div>
                              </div>
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
