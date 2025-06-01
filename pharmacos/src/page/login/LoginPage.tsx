import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showTokenNotice, setShowTokenNotice] = useState(false);
  const [showVerifyBtn, setShowVerifyBtn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerGender, setRegisterGender] = useState("male");
  const [registerDateOfBirth, setRegisterDateOfBirth] = useState("");
  const [registerSkinType, setRegisterSkinType] = useState("oily");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const daysInMonth =
    month && year ? new Date(Number(year), Number(month), 0).getDate() : 31;

  const handleYearChange = (y: string) => {
    setYear(y);
    const dob = y && month && day ? `${y}-${month}-${day}` : "";
    setRegisterDateOfBirth(dob);
  };
  const handleMonthChange = (m: string) => {
    setMonth(m);
    const dob = year && m && day ? `${year}-${m}-${day}` : "";
    setRegisterDateOfBirth(dob);
  };
  const handleDayChange = (d: string) => {
    setDay(d);
    const dob = year && month && d ? `${year}-${month}-${d}` : "";
    setRegisterDateOfBirth(dob);
  };

  const handleRegisterClick = () => {
    containerRef.current?.classList.add("login-active");
  };

  const handleLoginClick = () => {
    containerRef.current?.classList.remove("login-active");
  };

  const handleBackHome = () => {
    navigate("/");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setShowTokenNotice(false);
    setShowVerifyBtn(false);
    try {
      const res = await axios.post("http://localhost:10000/api/auth/register", {
        username: registerUsername,
        password: registerPassword,
        name: registerName,
        email: registerEmail,
        gender: registerGender,
        dateOfBirth: registerDateOfBirth,
        skinType: registerSkinType,
      });
      setRegisterSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
      );
      setShowTokenNotice(true);
      setShowVerifyBtn(true);
    } catch (err: any) {
      setRegisterError(err.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  const handleVerifyEmail = () => {
    navigate("/verify-email");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");
    try {
      const res = await axios.post("http://localhost:10000/api/auth/login", {
        username: loginUsername,
        password: loginPassword,
      });
      setLoginSuccess("Đăng nhập thành công!");
      localStorage.setItem("token", res.data.token);
      setTimeout(() => {
        const role = res.data.user?.role;
        console.log("ROLE:", role);
        if (role && role.toLowerCase() === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 1200);
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Đăng nhập thất bại!");
    }
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
          <form onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            <div className="login-input-box">
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="login-input-box">
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="login-forgot-link">
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="login-btn">
              Login
            </button>
            {loginError && (
              <div
                className="login-token-notice"
                style={{ color: "#d32f2f", background: "#ffebee" }}
              >
                {loginError}
              </div>
            )}
            {loginSuccess && (
              <div
                className="login-token-notice"
                style={{ color: "#388e3c", background: "#e8f5e9" }}
              >
                {loginSuccess}
              </div>
            )}
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
          <form onSubmit={handleRegisterSubmit}>
            <h1>Registration</h1>
            <div className="login-input-box">
              <input
                type="text"
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="login-input-box">
              <input
                type="text"
                placeholder="Full Name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="login-input-box">
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="login-input-box">
              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="login-input-box">
              <select
                value={registerGender}
                onChange={(e) => setRegisterGender(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#eee",
                  fontSize: 16,
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="login-input-box">
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "13px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: "#eee",
                    fontSize: 16,
                  }}
                >
                  <option value="">Year</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "13px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: "#eee",
                    fontSize: 16,
                  }}
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={day}
                  onChange={(e) => handleDayChange(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "13px 8px",
                    borderRadius: 8,
                    border: "none",
                    background: "#eee",
                    fontSize: 16,
                  }}
                >
                  <option value="">Day</option>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="login-input-box">
              <select
                value={registerSkinType}
                onChange={(e) => setRegisterSkinType(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#eee",
                  fontSize: 16,
                }}
              >
                <option value="oily">Oily</option>
                <option value="dry">Dry</option>
                <option value="combination">Combination</option>
                <option value="normal">Normal</option>
                <option value="sensitive">Sensitive</option>
              </select>
            </div>
            <button type="submit" className="login-btn">
              Register
            </button>
            {registerError && (
              <div
                className="login-token-notice"
                style={{ color: "#d32f2f", background: "#ffebee" }}
              >
                {registerError}
              </div>
            )}
            {registerSuccess && (
              <div
                className="login-token-notice"
                style={{ color: "#388e3c", background: "#e8f5e9" }}
              >
                {registerSuccess}
              </div>
            )}
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
