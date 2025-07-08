import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AuthStatus: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show AuthStatus on pages that have header (main website pages)
  const hideOnPages = [
    "/",
    "/products",
    "/blog",
    "/about",
    "/cart",
    "/profile",
  ];
  const shouldHide = hideOnPages.some(
    (page) =>
      location.pathname === page || location.pathname.startsWith(page + "/")
  );

  if (!currentUser || shouldHide) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {currentUser.photoURL && (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500" }}>
            {currentUser.displayName || currentUser.email}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {currentUser.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            background: "#f5f5f5",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthStatus;
