import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import axios from "axios";

const VerifyEmailPage: React.FC = () => {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.get(
        `https://pharmacos-server-be.onrender.com/api/auth/verify-email?token=${token}`
      );
      setMessage("Xác thực thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setMessage(
        err.response?.data?.message ||
          "Token không hợp lệ. Vui lòng kiểm tra lại!"
      );
    }
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="login-root">
      <button
        className="login-back-home-btn"
        onClick={handleBackHome}
        type="button"
      >
        ← Back to Home
      </button>
      <div
        className="login-container"
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 400,
            margin: "auto",
            textAlign: "center",
          }}
        >
          <h1>Xác thực Email</h1>
          <div className="login-input-box">
            <input
              type="text"
              placeholder="Nhập mã token từ email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn" style={{ marginTop: 12 }}>
            Xác nhận
          </button>
          {message && (
            <div className="login-token-notice" style={{ marginTop: 16 }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
