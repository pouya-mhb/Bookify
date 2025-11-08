import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Header() {
    const { cart } = useApp();

    const totalItems = cart?.total_items || 0;

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
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;