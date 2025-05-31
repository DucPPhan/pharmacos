import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showTokenNotice, setShowTokenNotice] = useState(false);
  const [showVerifyBtn, setShowVerifyBtn] = useState(false);

  const handleRegisterClick = () => {
    containerRef.current?.classList.add("login-active");
  };

  const handleLoginClick = () => {
    containerRef.current?.classList.remove("login-active");
  };

  const handleBackHome = () => {
    navigate("/");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTokenNotice(true);
    setShowVerifyBtn(true);
  };

  const handleVerifyEmail = () => {
    navigate("/verify-email");
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
      {showVerifyBtn && (
        <button
          className="login-verify-btn"
          onClick={handleVerifyEmail}
          type="button"
        >
          Verify Email
        </button>
      )}
      <div className="login-container" ref={containerRef}>
        <div className="login-form-box login-login">
          <form action="#">
            <h1>Login</h1>
            <div className="login-input-box">
              <input type="text" placeholder="Username" required />
              <i className="bx bxs-user"></i>
            </div>
            <div className="login-input-box">
              <input type="password" placeholder="Password" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="login-forgot-link">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="login-btn">
              Login
            </button>
            <p>or login with social platforms</p>
            <div className="login-social-icons">
              <a href="#">
                <i className="bx bxl-google"></i>
              </a>
              <a href="#">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#">
                <i className="bx bxl-github"></i>
              </a>
              <a href="#">
                <i className="bx bxl-linkedin"></i>
              </a>
            </div>
          </form>
        </div>
        <div className="login-form-box login-register">
          <form action="#" onSubmit={handleRegisterSubmit}>
            <h1>Registration</h1>
            <div className="login-input-box">
              <input type="text" placeholder="Username" required />
              <i className="bx bxs-user"></i>
            </div>
            <div className="login-input-box">
              <input type="email" placeholder="Email" required />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="login-input-box">
              <input type="password" placeholder="Password" required />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <button type="submit" className="login-btn">
              Register
            </button>
            {showTokenNotice && (
              <div className="login-token-notice">
                Token đã được gửi qua gmail!
              </div>
            )}
            <p>or register with social platforms</p>
            <div className="login-social-icons">
              <a href="#">
                <i className="bx bxl-google"></i>
              </a>
              <a href="#">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#">
                <i className="bx bxl-github"></i>
              </a>
              <a href="#">
                <i className="bx bxl-linkedin"></i>
              </a>
            </div>
          </form>
        </div>
        <div className="login-toggle-box">
          <div className="login-toggle-panel login-toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              className="login-btn register-btn"
              type="button"
              onClick={handleRegisterClick}
            >
              Register
            </button>
          </div>
          <div className="login-toggle-panel login-toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              className="login-btn login-btn"
              type="button"
              onClick={handleLoginClick}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
