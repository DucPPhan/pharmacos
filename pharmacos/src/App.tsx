import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import {
  useLocation,
  BrowserRouter,
  useRoutes,
  Routes,
  Route,
} from "react-router-dom";
import LoginPage from "./page/login/LoginPage";
import Home from "./components/home";
import routes from "tempo-routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./page/admin/Admindashboard";
import VerifyEmailPage from "./page/login/VerifyEmailPage";
import StaffDashboard from "./page/staff/Staffdashboard";
import UserProfile from "./page/profile/UserProfile";

function App() {
  const location = useLocation();
  if (location.pathname === "/login") {
    return <LoginPage />;
  }
  if (location.pathname === "/verify-email") {
    return <VerifyEmailPage />;
  }
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <Header />
        </div>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<UserProfile />} />


            {/* <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile/personal-info" element={<PersonalInfo />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />

          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
        <Footer />
      </div>
    </Suspense>
  );
}

export default App;