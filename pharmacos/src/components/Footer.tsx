import React from 'react'
import { Link } from 'react-router-dom';

const categories = [
    {
        id: 1,
        name: "Pharmaceuticals",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
        count: 120,
    },
    {
        id: 2,
        name: "Skincare",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
        count: 85,
    },
    {
        id: 3,
        name: "Haircare",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        count: 64,
    },
    {
        id: 4,
        name: "Makeup",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
        count: 92,
    },
    {
        id: 5,
        name: "Fragrances",
        image: "https://images.unsplash.com/photo-1615412704911-55d589229864?w=800&q=80",
        count: 43,
    },
    {
        id: 6,
        name: "Personal Care",
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
        count: 76,
    },
];

export default function Footer() {
    return (
        <div>
            <footer className="text-white py-12" style={{ backgroundColor: '#7494ec' }}>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-white">PharmaCos</h3>
                            <p className="text-white/90">
                                Your one-stop shop for pharmaceutical and cosmetic products.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/" className="text-white/80 hover:text-white hover:underline">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/products"
                                        className="text-white/80 hover:text-white hover:underline"
                                    >
                                        Products
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="text-white/80 hover:text-white hover:underline">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/contact"
                                        className="text-white/80 hover:text-white hover:underline"
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Categories</h4>
                            <ul className="space-y-2">
                                {categories.slice(0, 4).map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            to={`/category/${category.id}`}
                                            className="text-white/80 hover:text-white hover:underline"
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
                            <address className="text-white/80 not-italic">
                                <p>123 Pharmacy Street</p>
                                <p>Cosmetic City, PC 12345</p>
                                <p className="mt-2">Email: info@pharmacos.com</p>
                                <p>Phone: (123) 456-7890</p>
                            </address>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
                        <p>
                            &copy; {new Date().getFullYear()} PharmaCos. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}