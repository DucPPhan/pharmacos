import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

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
        name: 'Chăm sóc da mặt',
        subcategories: [
            {
                title: 'Theo loại sản phẩm',
                items: ['Sữa rửa mặt', 'Toner', 'Serum', 'Kem dưỡng', 'Mặt nạ']
            },
            {
                title: 'Theo vấn đề da',
                items: ['Mụn', 'Thâm nám', 'Lão hóa', 'Da nhạy cảm', 'Dầu nhờn']
            }
        ],
        popularProducts: [
            { id: 'p1', name: 'Serum Vitamin C', image: '/images/products/serum-c.jpg' },
            { id: 'p2', name: 'Sữa rửa mặt Cerave', image: '/images/products/cerave-cleanser.jpg' }
        ]
    },
    {
        id: 'body-care',
        name: 'Chăm sóc cơ thể',
        subcategories: [
            {
                title: 'Sản phẩm',
                items: ['Sữa tắm', 'Kem dưỡng thể', 'Tẩy tế bào chết', 'Xịt thơm']
            },
            {
                title: 'Vấn đề đặc biệt',
                items: ['Nứt gót chân', 'Rạn da', 'Viêm nang lông', 'Khô da']
            }
        ],
        popularProducts: [
            { id: 'b1', name: 'Kem dưỡng thể Cerave', image: '/images/products/body-lotion.jpg' },
            { id: 'b2', name: 'Tẩy tế bào chết cơ thể', image: '/images/products/body-scrub.jpg' }
        ]
    },
    {
        id: 'skin-solutions',
        name: 'Giải pháp làn da',
        subcategories: [
            {
                title: 'Theo loại da',
                items: ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm']
            },
            {
                title: 'Theo độ tuổi',
                items: ['Tuổi thanh thiếu niên', 'Tuổi 20-30', 'Tuổi 30-40', 'Tuổi 40+']
            }
        ],
        popularProducts: [
            { id: 's1', name: 'Bộ sản phẩm cho da dầu', image: '/images/products/oily-skin-set.jpg' },
            { id: 's2', name: 'Kem chống nắng cho da nhạy cảm', image: '/images/products/sensitive-sunscreen.jpg' }
        ]
    },
    {
        id: 'hair-care',
        name: 'Chăm sóc tóc - da đầu',
        subcategories: [
            {
                title: 'Loại sản phẩm',
                items: ['Dầu gội', 'Dầu xả', 'Kem ủ tóc', 'Serum tóc']
            },
            {
                title: 'Vấn đề tóc',
                items: ['Tóc khô xơ', 'Tóc dầu', 'Gàu', 'Rụng tóc']
            }
        ],
        popularProducts: [
            { id: 'h1', name: 'Dầu gội trị gàu', image: '/images/products/anti-dandruff.jpg' },
            { id: 'h2', name: 'Tinh dầu dưỡng tóc', image: '/images/products/hair-oil.jpg' }
        ]
    },
    {
        id: 'makeup',
        name: 'Mỹ phẩm trang điểm',
        subcategories: [
            {
                title: 'Khuôn mặt',
                items: ['Kem nền', 'Phấn phủ', 'Kem che khuyết điểm', 'Má hồng']
            },
            {
                title: 'Mắt',
                items: ['Mascara', 'Phấn mắt', 'Kẻ mắt', 'Bút kẻ lông mày']
            },
            {
                title: 'Môi',
                items: ['Son thỏi', 'Son kem', 'Son bóng', 'Son dưỡng']
            }
        ],
        popularProducts: [
            { id: 'm1', name: 'Kem nền lâu trôi', image: '/images/products/foundation.jpg' },
            { id: 'm2', name: 'Son môi lì', image: '/images/products/lipstick.jpg' }
        ]
    },
    {
        id: 'eye-care',
        name: 'Chăm sóc da vùng mắt',
        subcategories: [
            {
                title: 'Sản phẩm',
                items: ['Kem mắt', 'Mặt nạ mắt', 'Serum mắt', 'Gel mắt']
            },
            {
                title: 'Vấn đề vùng mắt',
                items: ['Thâm mắt', 'Bọng mắt', 'Nếp nhăn', 'Quầng thâm']
            }
        ],
        popularProducts: [
            { id: 'e1', name: 'Kem mắt chống lão hóa', image: '/images/products/eye-cream.jpg' },
            { id: 'e2', name: 'Mặt nạ mắt dưỡng ẩm', image: '/images/products/eye-mask.jpg' }
        ]
    },
    {
        id: 'natural-products',
        name: 'Sản phẩm từ thiên nhiên',
        subcategories: [
            {
                title: 'Nguyên liệu',
                items: ['Trà xanh', 'Aloe Vera', 'Tinh dầu', 'Mật ong', 'Dầu dừa']
            },
            {
                title: 'Công dụng',
                items: ['Dưỡng ẩm', 'Chống viêm', 'Làm dịu', 'Phục hồi']
            }
        ],
        popularProducts: [
            { id: 'n1', name: 'Gel nha đam', image: '/images/products/aloe-vera.jpg' },
            { id: 'n2', name: 'Dầu dừa nguyên chất', image: '/images/products/coconut-oil.jpg' }
        ]
    }
];

export default function CategoryNav() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Measure and set the navigation height as a CSS variable
    useEffect(() => {
        if (navRef.current) {
            const height = navRef.current.offsetHeight;
            document.documentElement.style.setProperty('--category-nav-height', `${height}px`);
        }
    }, []);

    // Handle mouse events for dropdown menu
    const handleMouseEnter = (categoryId: string) => {
        setActiveCategory(categoryId);
    };

    const handleMouseLeave = () => {
        // Only close if mouse isn't over dropdown
        if (!dropdownRef.current || !dropdownRef.current.matches(':hover')) {
            setActiveCategory(null);
        }
    };

    return (
        <div ref={navRef} className="bg-white border-b">
            <div className="container mx-auto px-4">
                <ul className="flex items-center justify-between text-sm md:text-base overflow-x-auto py-2 md:py-3 gap-3 md:gap-4">
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className="relative flex-shrink-0"
                            onMouseEnter={() => handleMouseEnter(category.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className="flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap">
                                {category.name}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* Dropdown with fixed positioning */}
                            {activeCategory === category.id && (
                                <div
                                    ref={dropdownRef}
                                    className="fixed left-0 right-0 bg-white shadow-xl border-t z-50"
                                    style={{
                                        top: 'calc(9% + var(--category-nav-height))',
                                        maxHeight: 'calc(100vh - var(--category-nav-height))',
                                        overflowY: 'auto'
                                    }}
                                    onMouseEnter={() => setActiveCategory(category.id)}
                                    onMouseLeave={() => setActiveCategory(null)}
                                >
                                    <div className="container mx-auto px-4 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                            {/* Subcategories */}
                                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {category.subcategories.map((subcategory, idx) => (
                                                    <div key={idx} className="space-y-3">
                                                        <h3 className="font-medium text-gray-900 text-lg border-b pb-2">{subcategory.title}</h3>
                                                        <ul className="space-y-2">
                                                            {subcategory.items.map((item, itemIdx) => (
                                                                <li key={itemIdx}>
                                                                    <Link
                                                                        to={`/category/${category.id}/${item.toLowerCase().replace(/\s+/g, '-')}`}
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

                                            {/* Popular products */}
                                            <div className="md:col-span-1">
                                                <h3 className="font-medium text-gray-900 text-lg border-b pb-2 mb-3">Sản phẩm bán chạy</h3>
                                                <div className="space-y-4">
                                                    {category.popularProducts.map((product) => (
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            key={product.id}
                                                            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors"
                                                        >
                                                            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                                {/* Uncomment when you have actual images */}
                                                                {/* <img 
                                                                    src={product.image} 
                                                                    alt={product.name} 
                                                                    className="w-full h-full object-cover"
                                                                /> */}
                                                            </div>
                                                            <span className="text-sm font-medium">{product.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}