import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Camera,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import AIImageSearch from "./AIImageSearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import CartDropdown from "./CartDropdown/CartDropdown";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const isLoggedIn = !!localStorage.getItem("user") || !!currentUser;
  const [isUser, setIsUser] = useState(true); // true if regular user or not logged in, false if staff

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.role === "staff") {
          setIsUser(false);
        } else {
          setIsUser(true);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        setIsUser(true); // Default to regular user on error
      }
    } else {
      setIsUser(true); // Default to regular user if not logged in
    }
  }, []); // Run once on component mount

  const handleAISearchComplete = (results) => {
    // Handle search results, perhaps navigate to search results page
    console.log("Search completed with results:", results);
    // Close the dialog after handling results if needed
    // setIsAISearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="bg-background">
      <header
        className="main-header sticky top-0 z-[100] w-full border-b shadow-sm"
        style={{ backgroundColor: "#7494ec" }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-2xl font-bold text-primary text-white"
              >
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
                  style={{ backgroundColor: "white" }}
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
                  style={{ position: "relative", left: "30px" }}
                  onClick={() => setIsAISearchOpen(true)}
                  title="Search by image"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
              <Link to="/products" className="hover:text-primary">
                Products
              </Link>
              <Link to="/blog" className="hover:text-primary">
                Blog
              </Link>
              <Link to="/about" className="hover:text-primary">
                About
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4 ml-4">
              <CartDropdown />

              {/* User Profile/Auth Section */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-white hover:bg-blue-600"
                    >
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="text-sm max-w-32 truncate">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm text-gray-700">
                      <div className="font-medium truncate">
                        {currentUser.displayName || "User"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!isUser) {
                      // User is staff
                      navigate("/staff/dashboard");
                    } else if (!isLoggedIn) {
                      // User is not staff AND not logged in
                      navigate("/login");
                    } else {
                      // User is not staff AND is logged in
                      navigate("/profile");
                    }
                  }}
                >
                  <User className="h-5 w-5 text-white" />
                </Button>
              )}
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
                  style={{ backgroundColor: "white" }}
                />
                <div className="ml-2 bg-white hover:bg-gray-100">
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

      <Dialog open={isAISearchOpen} onOpenChange={setIsAISearchOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="sr-only">AI Image Search</DialogTitle>
          </DialogHeader>
          <AIImageSearch
            onSearchComplete={handleAISearchComplete}
            isPopup={true}
            onClose={() => setIsAISearchOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
