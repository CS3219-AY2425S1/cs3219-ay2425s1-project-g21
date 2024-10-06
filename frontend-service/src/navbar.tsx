import React from 'react';
import { Link } from 'react-router-dom';
import "./navbar.css";

const NavBar: React.FC = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li className="account-button">
          <Link to="/account">My Account</Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar;