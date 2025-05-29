import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header>
    <div className="flex justify-between p-4 bg-white shadow">
      <h1>Pharmacos</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </div>
  </header>
);

export default Header;
