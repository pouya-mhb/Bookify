import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { cart } = useApp();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const totalItems = cart?.total_items || 0;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        BookStore
                    </Link>

                    <nav className="nav">
                        <Link to="/" className="nav-link">
                            Books
                        </Link>

                        {user ? (
                            <>
                                <Link to="/cart" className="nav-link cart-link">
                                    Cart
                                    {totalItems > 0 && (
                                        <span className="cart-badge">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/orders" className="nav-link">
                                    Orders
                                </Link>
                                <div className="user-menu">
                                    <span className="user-greeting">
                                        Hello, {user.username}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="logout-button"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login" className="nav-link">
                                    Login
                                </Link>
                                <Link to="/register" className="nav-link">
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;