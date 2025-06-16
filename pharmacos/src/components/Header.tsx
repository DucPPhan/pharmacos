import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Menu, Search, ShoppingCart, User, X, Camera } from 'lucide-react';
import { Button } from './ui/button';
import AIImageSearch from './AIImageSearch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import CartDropdown from './CartDropdown/CartDropdown';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAISearchOpen, setIsAISearchOpen] = useState(false);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("user");
    const [isUser, setIsUser] = useState(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if ( user && user.role === "staff") {
        setIsUser(false);
    }
    const handleAISearchComplete = (results) => {
        // Handle search results, perhaps navigate to search results page
        console.log('Search completed with results:', results);
        // Close the dialog after handling results if needed
        // setIsAISearchOpen(false);
    };

    return (
        <div className="bg-background">
            <header className="sticky top-0 z-50 w-full border-b shadow-sm" style={{ backgroundColor: '#7494ec' }}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-bold text-primary text-white">
                                PharmaCos
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center flex-1 mx-8">
                            <div className="relative w-full max-w-md flex items-center">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    className="pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-0 h-full bg-white hover:bg-gray-100 text-gray-700"
                                >
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                </Button>

                                {/* Camera icon for AI image search */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 bg-white hover:bg-gray-100 text-gray-700"
                                    style={{ position: 'relative', left: '30px' }}
                                    onClick={() => setIsAISearchOpen(true)}
                                    title="Search by image"
                                >
                                    <Camera className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex space-x-6">
                            <Link to="/" className="hover:text-primary">Home</Link>
                            <Link to="/products" className="hover:text-primary">Products</Link>
                            <Link to="/categories" className="hover:text-primary">Categories</Link>
                            <Link to="/about" className="hover:text-primary">About</Link>
                        </nav>

                        <div className="hidden md:flex items-center space-x-4 ml-4">
                            <Button variant="ghost" size="icon">
                                {/* <ShoppingCart className="h-5 w-5 text-white" /> */}
                                <CartDropdown />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    if (!isUser) {
                                        navigate("/staff");
                                    }
                                    if (!isLoggedIn) {
                                        navigate("/login");
                                    } else {
                                        navigate("/profile");
                                    }
                                }}
                            >
                                <User className="h-5 w-5 text-white" />
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5 text-white" />
                                ) : (
                                    <Menu className="h-5 w-5 text-white" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4">
                            <div className="relative mb-4 flex items-center">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    className="pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ backgroundColor: 'white' }}
                                />
                                <div className='ml-2 bg-white hover:bg-gray-100'>
                                    <Search className="absolute right-14 top-1.5 h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Camera icon for mobile */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 bg-white hover:bg-gray-100"
                                    onClick={() => setIsAISearchOpen(true)}
                                >
                                    <Camera className="h-5 w-5 text-gray-600" />
                                </Button>
                            </div>
                            <div className="flex flex-col space-y-2 text-white">
                                <Link
                                    to="/cart"
                                    className="flex items-center p-2 hover:bg-blue-600 rounded-md"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    <span>Cart</span>
                                </Link>
                                <Link
                                    to="/account"
                                    className="flex items-center p-2 hover:bg-blue-600 rounded-md"
                                >
                                    <User className="h-5 w-5 mr-2" />
                                    <span>Account</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* AI Image Search Dialog */}
            <Dialog open={isAISearchOpen} onOpenChange={setIsAISearchOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="sr-only">AI Image Search</DialogTitle>
                    </DialogHeader>
                    <AIImageSearch
                        onSearchComplete={handleAISearchComplete}
                        isPopup={true}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}