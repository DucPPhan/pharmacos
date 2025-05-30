<<<<<<< Updated upstream
function App() {
  return (
    <>
      <div className="font-bold">check</div>
    </>
  )
=======
import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Dashboard from "./page/admin/Admindashboard";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/personal-info" element={<PersonalInfo />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          <Route path="/admin/dashboard" element={<Dashboard/>} 
          
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
>>>>>>> Stashed changes
}

export default App
