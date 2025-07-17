import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import ProductGrid from "../../components/ProductGrid";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";

// Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  isOnSale?: boolean;
  image: string;
  images?: string[];
  category: string;
  categoryId: number;
  inStock: boolean;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  brand?: string;
  description?: string;
  benefits?: string[];
  ingredients?: string;
  usage?: string;
  specifications?: Record<string, string>;
  discount?: number;
  manufacturingDate?: string;
  expiryDate?: string;
}

// Reviews interface
interface Review {
  userId?: string;
  id?: string;
  userName?: string;
  rating: number;
  date?: string;
  title?: string;
  comment: string;
  helpful?: number;
  _id?: string;
  user?: { username?: string };
  createdAt?: string;
}

// Star rating component
const StarRating: React.FC<{ rating: number; size?: number }> = ({
  rating,
  size = 16,
}) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative">
          {/* Empty star (background) */}
          <Star size={size} className="text-gray-300" />

          {/* Filled star with clip based on rating */}
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, (rating - (star - 1)) * 100)
              )}%`,
            }}
          >
            <Star size={size} className="text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Move ReviewFormDialog outside of ProductDetailPage component
const ReviewFormDialog = ({
  open,
  onOpenChange,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  isSubmitting,
  onSubmit,
  userReview,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {userReview ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={`${star <= reviewRating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {reviewRating} {reviewRating === 1 ? "star" : "stars"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              placeholder="Tell others about your experience with this product"
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: "#7494ec" }}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Submitting</span>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </>
            ) : userReview ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ProductDetailPage: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const { productId } = useParams<{ productId: string }>();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:10000/api/products/${productId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        const p = data.data.product;
        if (data?.data?.product) {
          // Map images to array of url
          const images =
            Array.isArray(p.images) && p.images.length > 0
              ? p.images.map((img) => img.url)
              : [];
          setProduct({
            id: p._id || p.id,
            name: p.name,
            price: p.price,
            salePrice: p.salePrice,
            isOnSale: p.isOnSale,
            image: images[0] || "",
            images,
            category: p.category,
            categoryId: 0, // Nếu có categoryId thì lấy, không thì để 0
            inStock: p.stockQuantity > 0,
            tags: p.features,
            rating:
              p.reviews && p.reviews.length > 0
                ? p.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                p.reviews.length
                : undefined,
            reviewCount: p.reviews ? p.reviews.length : 0,
            brand: p.brand,
            description: p.description,
            benefits: p.benefits,
            ingredients: p.ingredients
              ? p.ingredients.map(
                (i) => `${i.name} (${i.percentage}%) - ${i.purpose}`
              )
              : undefined,
            usage: p.instructions,
            specifications: {
              Size: p.size,
              "Skin Type": p.skinType?.join(", "),
            },
            discount: undefined, // Nếu có discount thì lấy
            manufacturingDate: p.manufacturingDate,
            expiryDate: p.expiryDate,
          });
          setReviews(p.reviews || []);
        }
        setSimilarProducts(
          (data?.data?.similarProducts || []).map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            price: p.price,
            image:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images.find((img) => img.isPrimary)?.url || p.images[0].url
                : "",
            category: p.category,
            categoryId: 0,
            inStock: p.stockQuantity > 0,
            rating:
              p.reviews && p.reviews.length > 0
                ? p.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                p.reviews.length
                : undefined,
            brand: p.brand,
          }))
        );
        if (
          p.reviews.userId ===
          JSON.parse(localStorage.getItem("user") || "{}").id
        ) {
          setUserReview(p.reviews);
        }
      } catch {
        setProduct(null);
        setReviews([]);
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Check if user is logged in and if they have already reviewed
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    setIsLoggedIn(!!token && !!userId);

    if (reviews.length > 0 && userId) {
      // Find the user's review if it exists
      const foundReview = reviews.find((review) => review.userId === userId);
      // setUserReview(foundReview || null);

      // For debugging
      // console.log("User ID:", userId);
      // console.log("Found review:", foundReview);
      console.log("All reviews:", reviews);
    }
  }, [reviews]);

  // Check if the product is a favorite
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!productId || !isLoggedIn) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:10000/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const favorites = data.data || [];
          // Check if this product is in the favorites list
          const isFav = favorites.some(
            (fav) =>
              fav.product._id === productId || fav.product.id === productId
          );
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [productId, isLoggedIn]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products">
          <Button style={{ backgroundColor: "#7494ec" }}>
            Browse All Products
          </Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;

    // Add the product with the current quantity
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity
    ); // Pass the quantity here

    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? "item" : "items"} of ${product.name
        } ${quantity === 1 ? "has" : "have"} been added to your cart`,
    });
  };

  const handleOpenReviewForm = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      return;
    }

    // If editing an existing review, populate the form
    if (userReview) {
      setReviewRating(userReview.rating);
      setReviewComment(userReview.comment);
    } else {
      // Reset form for a new review
      setReviewRating(5);
      setReviewComment("");
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a comment for your review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      const userName = JSON.parse(localStorage.getItem("user"))?.name || "User";

      // Include subcategory to prevent validation error
      const reviewData = {
        rating: reviewRating,
        comment: reviewComment,
        subcategory: "temporary", // Add this to prevent validation error
      };

      // If updating an existing review
      if (userReview) {
        const response = await fetch(
          `http://localhost:10000/api/products/${productId}/reviews/${userReview.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reviewData),
          }
        );

        if (response.ok) {
          // Update the review in the local state
          const updatedReviews = reviews.map((review) =>
            review.id === userReview.id
              ? {
                ...review,
                userId: userId || "",
                rating: reviewRating,
                comment: reviewComment,
                date: new Date().toISOString(),
              }
              : review
          );

          setReviews(updatedReviews);
          setUserReview({
            ...userReview,
            rating: reviewRating,
            comment: reviewComment,
            date: new Date().toISOString(),
          });

          // Update the product rating
          const newRating =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length;
          setProduct((prev) =>
            prev
              ? {
                ...prev,
                rating: newRating,
                reviewCount: updatedReviews.length,
              }
              : null
          );

          toast({
            title: "Review Updated",
            description: "Your review has been updated successfully",
          });

          setShowReviewForm(false);
        } else {
          // Handle API error
          handleApiError(response);
        }
      } else {
        // Creating a new review
        const response = await fetch(
          `http://localhost:10000/api/products/${productId}/reviews`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reviewData),
          }
        );

        if (response.ok) {
          const result = await response.json();

          const newReview = {
            id: result.id || result._id || `temp-${Date.now()}`,
            userId: userId || "",
            userName: userName,
            rating: reviewRating,
            title: "",
            comment: reviewComment,
            date: new Date().toISOString(),
            helpful: 0,
          };

          // Add the new review to local state
          const updatedReviews = [...reviews, newReview];
          setReviews(updatedReviews);
          setUserReview(newReview);

          // Update the product rating
          const newRating =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length;
          setProduct((prev) =>
            prev
              ? {
                ...prev,
                rating: newRating,
                reviewCount: updatedReviews.length,
              }
              : null
          );

          toast({
            title: "Review Submitted",
            description: "Your review has been submitted successfully",
          });

          setShowReviewForm(false);
        } else {
          // Handle API error
          handleApiError(response);
        }
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast({
        title: "Error",
        description:
          "There was a problem with your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to handle API errors
  const handleApiError = async (response) => {
    try {
      const errorData = await response.json();
      let errorMessage = "There was a problem with your request";

      if (errorData && errorData.message) {
        errorMessage = errorData.message;

        // Special handling for subcategory error
        if (errorMessage.includes("subcategory")) {
          errorMessage =
            "This product is missing required information. Please contact support.";

          // Try an alternative approach - fetch the product first to get subcategory
          tryAlternativeSubmission();
          return;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "There was a problem processing your request",
        variant: "destructive",
      });
    }
  };

  // Alternative submission approach
  const tryAlternativeSubmission = async () => {
    try {
      const token = localStorage.getItem("token");

      // First, get the full product details including subcategory
      const productResponse = await fetch(
        `http://localhost:10000/api/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!productResponse.ok) {
        throw new Error("Could not fetch product details");
      }

      const productData = await productResponse.json();
      const product = productData?.data?.product;

      if (!product) {
        throw new Error("Product data not found");
      }

      // Now try submitting the review with the subcategory included
      const reviewData = {
        rating: reviewRating,
        comment: reviewComment,
        subcategory: product.subcategory || "default",
      };

      const submitUrl = userReview
        ? `http://localhost:10000/api/products/${productId}/reviews/${userReview.id}`
        : `http://localhost:10000/api/products/${productId}/reviews`;

      const submitMethod = userReview ? "PUT" : "POST";

      const response = await fetch(submitUrl, {
        method: submitMethod,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        toast({
          title: userReview ? "Review Updated" : "Review Submitted",
          description: userReview
            ? "Your review has been updated successfully"
            : "Your review has been submitted successfully",
        });

        setShowReviewForm(false);

        // Refresh the product page to show the updated review
        window.location.reload();
      } else {
        throw new Error("Alternative submission failed");
      }
    } catch (error) {
      console.error("Alternative submission error:", error);
      toast({
        title: "Error",
        description:
          "We're experiencing technical difficulties. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview || !isLoggedIn) return;

    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:10000/api/products/${productId}/reviews/${userReview.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove the review from local state
        const updatedReviews = reviews.filter(
          (review) => review.id !== userReview.id
        );
        setReviews(updatedReviews);
        setUserReview(null);

        // Update the product rating
        const newRating =
          updatedReviews.length > 0
            ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length
            : 0;

        setProduct((prev) =>
          prev
            ? {
              ...prev,
              rating: newRating,
              reviewCount: updatedReviews.length,
            }
            : null
        );

        toast({
          title: "Review Deleted",
          description: "Your review has been deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem deleting your review",
        variant: "destructive",
      });
    }
  };

  // Calculate discounted price if applicable
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please login to add products to favorites",
        duration: 3000,
      });
      return;
    }

    if (!productId) return;

    try {
      // Optimistically update UI immediately
      setIsFavorite(!isFavorite);

      const token = localStorage.getItem("token");
      const method = isFavorite ? "DELETE" : "POST";
      const url = `http://localhost:10000/api/favorites/${productId}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast({
          title: isFavorite ? "Removed from favorites" : "Added to favorites",
          description: isFavorite
            ? "Product has been removed from your favorites"
            : "Product has been added to your favorites",
          duration: 3000,
        });
      } else {
        // Revert UI if API call failed
        setIsFavorite(isFavorite);
        throw new Error("Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      // Revert UI if API call failed
      setIsFavorite(isFavorite);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary flex items-center">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link
          to={`/category/${product.categoryId}`}
          className="hover:text-primary"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-700 font-medium truncate">
          {product.name}
        </span>
      </nav>

      {/* Product details section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product images */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-white aspect-square">
            <img
              src={product.images?.[selectedImage] || product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Thumbnail images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`border rounded overflow-hidden w-20 h-20 flex-shrink-0 ${selectedImage === index
                    ? "border-primary border-2"
                    : "border-gray-200"
                    }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <Link
                to={`/brand/${product.brand}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                {product.brand}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {product.name}
            </h1>

            <div className="flex items-center mt-2 space-x-4">
              {product.rating && (
                <div className="flex items-center">
                  <StarRating rating={product.rating} />
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3">
            {product.isOnSale && product.salePrice != null ? (
              <>
                <span className="text-2xl font-bold text-red-600">
                  {formatVND(product.salePrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatVND(product.price)}
                </span>
                <Badge className="bg-red-500">SALE</Badge>
              </>
            ) : (
              <span className="text-2xl font-bold">
                {formatVND(product.price)}
              </span>
            )}
          </div>
          {/* MFG & EXP */}
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 font-medium">MFG:</span>
              <span className="text-sm font-semibold">
                {product.manufacturingDate ? new Date(product.manufacturingDate).toLocaleDateString() : "-"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 font-medium">EXP:</span>
              <span className="text-sm font-semibold">
                {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center">
            {product.inStock ? (
              <Badge className="bg-green-500 text-white">In Stock</Badge>
            ) : (
              <Badge variant="secondary" className="text-red-500 border-red-500">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Short description */}
          <p className="text-gray-600">{product.description}</p>

          {/* Product benefits */}
          {product.benefits && (
            <div className="space-y-2">
              <h3 className="font-medium">Benefits:</h3>
              <ul className="space-y-1">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to cart */}
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center border rounded-md">
                <button
                  className="px-3 py-1 text-xl"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={!product.inStock}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
                  disabled={!product.inStock}
                />
                <button
                  className="px-3 py-1 text-xl"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  disabled={!product.inStock}
                >
                  +
                </button>
              </div>
              <Button
                className="flex-grow flex items-center justify-center gap-2"
                disabled={!product.inStock}
                style={{ backgroundColor: "#7494ec" }}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={toggleFavorite}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? "text-red-500 fill-red-500" : ""
                    }`}
                />
              </Button>
            </div>
          </div>

          {/* Additional info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product.specifications &&
              Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Product details tabs */}
      <div className="mb-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto mb-6">
            <TabsTrigger
              value="description"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="ingredients"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
            >
              Ingredients
            </TabsTrigger>
            <TabsTrigger
              value="howToUse"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
            >
              How to Use
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none px-4 py-2"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-0">
            <div className="prose max-w-none">
              <p className="mb-4">{product.description}</p>

              {product.benefits && (
                <>
                  <h3 className="text-lg font-medium mb-2">Key Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-0">
            <div className="prose max-w-none">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-start mb-4">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Ingredients are subject to change. Please refer to the
                    product packaging for the most up-to-date ingredient list.
                  </p>
                </div>
                <p className="whitespace-pre-line leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="howToUse" className="mt-0">
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium mb-2">Directions</h3>
              <p className="mb-4">{product.usage}</p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <p className="text-sm">
                    For best results, use as part of your morning skincare
                    routine. Always follow with sunscreen during the day.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <div className="space-y-8">
              {/* Reviews summary */}
              <div className="flex flex-col md:flex-row gap-6 md:items-center p-6 bg-gray-50 rounded-lg">
                <div className="text-center md:border-r md:pr-6">
                  <div className="text-4xl font-bold text-primary">
                    {product.rating?.toFixed(1) || "0.0"}
                  </div>
                  <StarRating rating={product.rating || 0} size={20} />
                  <div className="text-sm text-gray-500 mt-1">
                    {product.reviewCount}{" "}
                    {product.reviewCount === 1 ? "review" : "reviews"}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(
                        (r) => Math.round(r.rating) === star
                      ).length;
                      const percentage = reviews.length
                        ? (count / reviews.length) * 100
                        : 0;

                      return (
                        <div key={star} className="flex items-center">
                          <div className="w-12 text-sm text-gray-600">
                            {star} stars
                          </div>
                          <div className="flex-grow mx-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-8 text-xs text-gray-500">
                            {percentage.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* XÓA các nút review ở đây */}
              </div>

              {/* Individual reviews */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => {
                    const key = review._id || review.id;
                    return (
                      <div
                        key={key}
                        className={`border-b pb-6 ${review.id === userReview?.id ? "bg-blue-50 p-4 rounded-lg" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {review.user?.username || review.userName || "Unknown"}
                              {review.id === userReview?.id && (
                                <span className="ml-2 text-blue-600 text-sm">
                                  (Your review)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              <StarRating rating={review.rating} />
                              <span className="ml-2 text-sm text-gray-500">
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString()
                                  : review.date
                                    ? new Date(review.date).toLocaleDateString()
                                    : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium mt-3">{review.title}</h4>
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                    {/* KHÔNG render nút Write a Review ở đây */}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">You Might Also Like</h2>
          <Link
            to={`/category/${product.categoryId}`}
            className="text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <ProductGrid products={similarProducts} />
      </div> */}
    </div>
  );
};

export default ProductDetailPage;
