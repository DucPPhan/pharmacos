import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("user");

    return (
        <div className="bg-background">
            <header className="sticky top-0 z-50 w-full border-b shadow-sm" style={{backgroundColor: '#7494ec'}}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-bold text-primary text-white">
                                PharmaCos
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center flex-1 mx-8">
                            <div className="relative w-full max-w-md">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    className="pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{backgroundColor: 'white'}}
                                />
                                <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <Button variant="ghost" size="icon">
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        navigate("/login");
                                    } else {
                                        navigate("/profile");
                                    }
                                }}
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4">
                            <div className="relative mb-4">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    className="pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to="/cart"
                                    className="flex items-center p-2 hover:bg-muted rounded-md"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    <span>Cart</span>
                                </Link>
                                <Link
                                    to="/account"
                                    className="flex items-center p-2 hover:bg-muted rounded-md"
                                >
                                    <User className="h-5 w-5 mr-2" />
                                    <span>Account</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </div>
    )
}
