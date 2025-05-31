import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const VerifyEmailPage: React.FC = () => {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập xác thực token, bạn có thể thay bằng gọi API thực tế
    if (token.trim() === "123456") {
      setMessage("Xác thực thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setMessage("Token không hợp lệ. Vui lòng kiểm tra lại!");
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
