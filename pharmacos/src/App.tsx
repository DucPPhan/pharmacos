import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
// import Home from "./components/home";
import routes from "tempo-routes";
// import Login from "./pages/login";
// import Cart from "./pages/cart";
// import Profile from "./pages/profile";
// import PersonalInfo from "./pages/profile/personal-info";
// import ChangePassword from "./pages/profile/change-password";
// import AdminDashboard from "./pages/admin/dashboard";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/personal-info" element={<PersonalInfo />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
