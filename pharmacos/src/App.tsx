import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Home from "./screens/Home";
// import routes from "tempo-routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import Login from "./pages/login";
// import Cart from "./pages/cart";
// import Profile from "./pages/profile";
// import PersonalInfo from "./pages/profile/personal-info";
// import ChangePassword from "./pages/profile/change-password";
// import AdminDashboard from "./pages/admin/dashboard";

function App() {
  return (
    <Router>
      <Header />
      <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/personal-info" element={<PersonalInfo />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          </Routes>
          {/* {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)} */}
      </Suspense>
      <Footer />
    </Router>
  );
}

export default App;
