import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import './CategoryNav.css';
import { motion, AnimatePresence } from 'framer-motion';
import { saveFilterState } from '@/utils/homeSessionStorage';

type CategoryItem = {
    id: string;
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

const categories: CategoryItem[] = [
    {
        id: 'facial-skincare',
        name: 'Facial Skincare',
        subcategories: [
            {
                title: 'By Product Type',
                items: ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Face Mask']
            },
            {
                title: 'By Skin Concern',
                items: ['Acne', 'Dark Spots', 'Aging', 'Sensitive Skin', 'Oily Skin']
            }
        ],
        popularProducts: [
            { id: '1', name: 'Vitamin C Serum', image: '/images/products/serum-c.jpg' },
            { id: '2', name: 'Cerave Facial Cleanser', image: '/images/products/cerave-cleanser.jpg' }
        ]
    },
    {
        id: 'body-care',
        name: 'Body Care',
        subcategories: [
            {
                title: 'Products',
                items: ['Body Wash', 'Body Lotion', 'Body Scrub', 'Body Mist']
            },
            {
                title: 'Special Concerns',
                items: ['Cracked Heels', 'Stretch Marks', 'Folliculitis', 'Dry Skin']
            }
        ],
        popularProducts: [
            { id: 'b1', name: 'Cerave Body Lotion', image: '/images/products/body-lotion.jpg' },
            { id: 'b2', name: 'Body Exfoliating Scrub', image: '/images/products/body-scrub.jpg' }
        ]
    },
    {
        id: 'skin-solutions',
        name: 'Skin Solutions',
        subcategories: [
            {
                title: 'By Skin Type',
                items: ['Oily Skin', 'Dry Skin', 'Combination Skin', 'Sensitive Skin']
            },
            {
                title: 'By Age',
                items: ['Teens', '20s-30s', '30s-40s', '40+']
            }
        ],
        popularProducts: [
            { id: 's1', name: 'Oily Skin Product Set', image: '/images/products/oily-skin-set.jpg' },
            { id: 's2', name: 'Sensitive Skin Sunscreen', image: '/images/products/sensitive-sunscreen.jpg' }
        ]
    },
    {
        id: 'hair-care',
        name: 'Hair & Scalp Care',
        subcategories: [
            {
                title: 'Product Types',
                items: ['Shampoo', 'Conditioner', 'Hair Mask', 'Hair Serum']
            },
            {
                title: 'Hair Concerns',
                items: ['Dry Hair', 'Oily Hair', 'Dandruff', 'Hair Loss']
            }
        ],
        popularProducts: [
            { id: 'h1', name: 'Anti-Dandruff Shampoo', image: '/images/products/anti-dandruff.jpg' },
            { id: 'h2', name: 'Hair Oil Treatment', image: '/images/products/hair-oil.jpg' }
        ]
    },
    {
        id: 'makeup',
        name: 'Makeup',
        subcategories: [
            {
                title: 'Face',
                items: ['Foundation', 'Powder', 'Concealer', 'Blush']
            },
            {
                title: 'Eyes',
                items: ['Mascara', 'Eyeshadow', 'Eyeliner', 'Eyebrow Pencil']
            },
            {
                title: 'Lips',
                items: ['Lipstick', 'Lip Cream', 'Lip Gloss', 'Lip Balm']
            }
        ],
        popularProducts: [
            { id: 'm1', name: 'Long-lasting Foundation', image: '/images/products/foundation.jpg' },
            { id: 'm2', name: 'Matte Lipstick', image: '/images/products/lipstick.jpg' }
        ]
    },
    {
        id: 'eye-care',
        name: 'Eye Care',
        subcategories: [
            {
                title: 'Products',
                items: ['Eye Cream', 'Eye Mask', 'Eye Serum', 'Eye Gel']
            },
            {
                title: 'Eye Area Concerns',
                items: ['Dark Circles', 'Eye Bags', 'Wrinkles', 'Puffiness']
            }
        ],
        popularProducts: [
            { id: 'e1', name: 'Anti-Aging Eye Cream', image: '/images/products/eye-cream.jpg' },
            { id: 'e2', name: 'Hydrating Eye Mask', image: '/images/products/eye-mask.jpg' }
        ]
    },
    {
        id: 'natural-products',
        name: 'Natural Products',
        subcategories: [
            {
                title: 'Ingredients',
                items: ['Green Tea', 'Aloe Vera', 'Essential Oils', 'Honey', 'Coconut Oil']
            },
            {
                title: 'Benefits',
                items: ['Hydration', 'Anti-inflammatory', 'Soothing', 'Restoration']
            }
        ],
        popularProducts: [
            { id: 'n1', name: 'Aloe Vera Gel', image: '/images/products/aloe-vera.jpg' },
            { id: 'n2', name: 'Pure Coconut Oil', image: '/images/products/coconut-oil.jpg' }
        ]
    }
];

export default function CategoryNav() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (navRef.current) {
            const height = navRef.current.offsetHeight;
            document.documentElement.style.setProperty('--category-nav-height', `${height}px`);
        }
    }, []);

    useEffect(() => {
        const classList = document.body.classList;
        if (activeCategory) {
            document.body.classList.add('dropdown-active');
            classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('dropdown-active');
            classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('dropdown-active');
            classList.remove('overflow-hidden');
        };
    }, [activeCategory]);

    const handleCategoryClick = (categoryId: string, subcategory?: string) => {
        console.log("handleCategoryClick called with:", { categoryId, subcategory });
        const filteredSubcategory = subcategory && subcategory.trim() !== '' ? subcategory : undefined;

        // Save filter state to session storage
        saveFilterState({
            category: categoryId,
            subcategory: filteredSubcategory
        });

        console.log("Session storage after save:", sessionStorage.getItem('pharmacos_filter_state'));

        // Navigate to products page
        navigate('/products');
    };

    const handleMouseEnter = (categoryId: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveCategory(categoryId);
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
                        top: 'calc(var(--category-nav-height) + 9%)',
                        opacity: activeCategory ? 1 : 0
                    }}
                />
            )}

            <div ref={navRef} className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-between text-sm md:text-base overflow-x-auto gap-3 md:gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter(category.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <li className="relative flex-shrink-0">
                                    <div className="cursor-pointer hover:bg-gray-50 rounded-md md:px-3 md:py-3">
                                        <div className="flex items-center gap-1 whitespace-nowrap group">
                                            <span className={`transition-colors ${activeCategory === category.id
                                                ? 'text-[#7494ec]'
                                                : 'hover:text-[#7494ec]'
                                                }`}>
                                                {category.name}
                                            </span>
                                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeCategory === category.id
                                                ? 'text-[#7494ec] rotate-180'
                                                : 'group-hover:text-[#7494ec]'
                                                }`} />
                                            <div className={`absolute bottom-1 left-3 right-3 h-0.5 bg-[#7494ec] transform transition-transform duration-300 ${activeCategory === category.id
                                                ? 'scale-x-100'
                                                : 'scale-x-0 group-hover:scale-x-100'
                                                }`} />
                                        </div>
                                    </div>
                                </li>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {activeCategory === category.id && dropdownVisible && (
                                        <motion.div
                                            key={activeCategory}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="fixed left-0 right-0 bg-white shadow-xl border-t z-50"
                                            style={{
                                                top: 'calc(9% + var(--category-nav-height))',
                                                maxHeight: 'calc(100vh - var(--category-nav-height))',
                                                overflowY: 'auto'
                                            }}
                                        >
                                            <div className="container mx-auto px-4 py-6">
                                                {(() => {
                                                    const cat = categories.find((c) => c.id === activeCategory);
                                                    if (!cat) return null;

                                                    return (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                {cat.subcategories.map((subcategory, idx) => (
                                                                    <div key={idx} className="space-y-3">
                                                                        <h3 className="font-medium text-gray-900 text-lg border-b pb-2">{subcategory.title}</h3>
                                                                        <ul className="space-y-2">
                                                                            {subcategory.items.map((item, itemIdx) => (
                                                                                <li key={itemIdx}>
                                                                                    <Link
                                                                                        to="/products"
                                                                                        onClick={() => handleCategoryClick(cat.id, item.toLowerCase().replace(/\s+/g, '-'))}
                                                                                        className="text-gray-600 hover:text-primary hover:underline"
                                                                                    >
                                                                                        {item}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Popular Products */}
                                                            <div className="md:col-span-1">
                                                                <h3 className="font-medium text-gray-900 text-lg border-b pb-2 mb-3">Best seller</h3>
                                                                <div className="space-y-4">
                                                                    {cat.popularProducts.map((product) => (
                                                                        <Link
                                                                            to={`/product/${product.id}`}
                                                                            key={product.id}
                                                                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
                                                                        >
                                                                            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                                            </div>
                                                                            <span className="text-sm font-medium">{product.name}</span>
                                                                        </Link>
                                                                    ))}
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