import { Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  useLocation,
  BrowserRouter,
  useRoutes,
  Routes,
  Route,
} from "react-router-dom";
import LoginPage from "./page/login/LoginPage";
import Home from "./page/home/home";
import routes from "tempo-routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./page/admin/Admindashboard";
import VerifyEmailPage from "./page/login/VerifyEmailPage";
import Staffdashboard from "./page/staff/Staffdashboard";
import CategoryPage from "./page/Category/CategoryPage";
import ProductDetailPage from "./page/ProductDetail/ProductDetailPage";
import ProductsPage from "./page/Products/ProductsPage";
import UserProfile from "./page/profile/UserProfile";

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
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-background">
        {visible && (
          <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
            <Header />
          </div>
        )}
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<UserProfile />} />


            {/* <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile/personal-info" element={<PersonalInfo />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/staff/dashboard/*" element={<Staffdashboard />} />



          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
        {visible && (
          <Footer />
        )}
      </div>
    </Suspense>
  );
}

export default App;