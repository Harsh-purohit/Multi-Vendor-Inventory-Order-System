import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2>🛒 Multi-Vendor Store</h2>
      <div>
        <Link to="/">Products</Link>

        {user ? (
          <>
            {user.role === "user" && (
              <Link to={`/orders/user/${user.id}/orders`}>My Orders</Link>
            )}
            {user.role === "vendor" && (
              <Link to={`/vendor/${user.vendorRef}`}>Dashboard</Link>
            )}
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
