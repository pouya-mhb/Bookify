import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { orderAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Cart() {
    const { cart, updateCartItem, removeFromCart, clearCart, loadCart } = useApp();
    const { user } = useAuth();
    const [updating, setUpdating] = useState(null);
    const [ordering, setOrdering] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Cart component mounted, user:', user);
        if (user) {
            loadCartData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadCartData = async (force = false) => {
        console.log('Loading cart data, force:', force);
        setLoading(true);
        setError(null);
        try {
            await loadCart();
            console.log('Cart loaded successfully');
        } catch (error) {
            console.error('Error loading cart:', error);
            setError('Failed to load cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(itemId);
        try {
            await updateCartItem(itemId, newQuantity);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update quantity');
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item from your cart?')) {
            try {
                await removeFromCart(itemId);
            } catch (error) {
                alert('Failed to remove item from cart');
            }
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your entire cart?')) {
            try {
                await clearCart();
            } catch (error) {
                alert('Failed to clear cart');
            }
        }
    };

    const handleCreateOrder = async () => {
        if (!cart || !cart.items || cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setOrdering(true);
        try {
            await orderAPI.createOrder();
            alert('Order created successfully!');
            // Clear the cart after successful order
            await clearCart();
            navigate('/orders');
        } catch (error) {
            console.error('Order creation error:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.detail ||
                'Failed to create order. Please try again.';
            alert(errorMessage);
        } finally {
            setOrdering(false);
        }
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="container cart-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container cart-container">
                <div className="empty-state">
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your cart.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="auth-button"
                        style={{ marginTop: '1rem' }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container cart-container">
                <div className="empty-state">
                    <h2>Error Loading Cart</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => loadCartData(true)}
                        className="auth-button"
                        style={{ marginTop: '1rem' }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="container cart-container">
                <div className="empty-state">
                    <h2>Your Cart is Empty</h2>
                    <p>Add some books to your cart to see them here.</p>
                    <button
                        onClick={handleContinueShopping}
                        className="auth-button"
                        style={{ marginTop: '1rem' }}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container cart-container">
            <div className="cart-header">
                <h1 className="page-title">Your Shopping Cart</h1>
                <div className="cart-actions">
                    <button
                        onClick={handleClearCart}
                        className="clear-cart-btn"
                        disabled={ordering}
                    >
                        Clear Cart
                    </button>
                    <button
                        onClick={handleContinueShopping}
                        className="continue-shopping-btn"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>

            <div className="cart-items-container">
                {cart.items.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="cart-item-content">
                            <div className="item-info">
                                <div className="item-details">
                                    <h3 className="item-title">{item.book.title}</h3>
                                    <p className="item-author">by {item.book.author}</p>
                                    <p className="item-price">Price: ${item.book.price}</p>
                                </div>

                                <div className="item-controls">
                                    <div className="quantity-section">
                                        <label className="quantity-label">Quantity:</label>
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updating === item.id}
                                                className="quantity-btn"
                                            >
                                                -
                                            </button>
                                            <span className="quantity-display">
                                                {updating === item.id ? '...' : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={updating === item.id || item.quantity >= item.book.stock}
                                                className="quantity-btn"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="item-total-section">
                                        <p className="item-total">Total: ${item.total_price}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-btn"
                                            disabled={ordering}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
                <div className="summary-header">
                    <h3>Order Summary</h3>
                </div>

                <div className="summary-details">
                    <div className="summary-row">
                        <span>Items ({cart.total_items || cart.items.length}):</span>
                        <span>${cart.total_price || cart.items.reduce((total, item) => total + parseFloat(item.total_price), 0).toFixed(2)}</span>
                    </div>

                    <div className="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                    </div>

                    <div className="summary-row total-row">
                        <span><strong>Total:</strong></span>
                        <span><strong>${cart.total_price || cart.items.reduce((total, item) => total + parseFloat(item.total_price), 0).toFixed(2)}</strong></span>
                    </div>
                </div>

                <button
                    onClick={handleCreateOrder}
                    disabled={ordering || cart.items.length === 0}
                    className="checkout-btn"
                >
                    {ordering ? 'Creating Order...' : 'Proceed to Checkout'}
                </button>

                {cart.items.length > 0 && (
                    <p className="checkout-note">
                        You'll have a chance to review your order before payment.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Cart;