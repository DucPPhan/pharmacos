import { Suspense, useEffect, useState, lazy } from "react";
import ReactDOM from "react-dom/client";
import {
  useLocation,
  BrowserRouter,
  useRoutes,
  Routes,
  Route,
} from "react-router-dom";
import LoginPage from "./page/login/LoginPage";
import routes from "tempo-routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./page/admin/Admindashboard";
import VerifyEmailPage from "./page/login/VerifyEmailPage";
import Staffdashboard from "./page/staff/Staffdashboard";
import { CartProvider } from "./contexts/CartContext";
import OrderConfirmation from "./page/OrderConfirmation/OrderConfirmation";
import ScrollToTop from "./components/ui/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import FullScreenLoader from "./components/FullScreenLoader/FullScreenLoader";

// Lazy load a apges for better transition experience
const Home = lazy(() => import("./page/home/home"));
const ProductsPage = lazy(() => import("./page/Products/ProductsPage"));
const ProductDetailPage = lazy(() => import("./page/ProductDetail/ProductDetailPage"));
const CategoryPage = lazy(() => import("./page/Category/CategoryPage"));
const UserProfile = lazy(() => import("./page/profile/UserProfile"));
const Cart = lazy(() => import("./page/cart"));
const OrderDetail = lazy(() => import("./page/order/OrderDetail"));


function App() {
  const [visible, setVisible] = useState(true);
  const location = useLocation();
  useEffect(() => {
    // Check if the current path is admin dashboard or staff dashboard
    if (
      location.pathname === "/admin/dashboard" ||
      location.pathname.startsWith("/staff/dashboard")
    ) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [location.pathname]);
  if (location.pathname === "/login") {
    return <LoginPage />;
  }
  if (location.pathname === "/verify-email") {
    return <VerifyEmailPage />;
  }
  return (
    <CartProvider>
      <Suspense fallback={<FullScreenLoader />}>
        <ScrollToTop />
        <div className="min-h-screen bg-background">
          {visible && (
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
              <Header />
            </div>
          )}
          <>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />

              {/* <Route path="/profile/personal-info" element={<PersonalInfo />} />
              <Route path="/profile/change-password" element={<ChangePassword />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />

              {/* Protected routes */}
              <Route
                path="/profile/*"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />

              {/* Your other routes */}
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/staff/dashboard/*" element={<Staffdashboard />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/order/:id" element={<OrderDetail />} />
            </Routes>
          </>
          {visible && <Footer />}
        </div>
        <Toaster />
      </Suspense>
    </CartProvider>
  );
}

export default App;