import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { orderAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const { cart, updateCartItem, removeFromCart, clearCart } = useApp();
    const [updating, setUpdating] = useState(null);
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();

    if (!cart || !cart.items) {
        return (
            <div className="container cart-container">
                <div className="empty-state">
                    <p>Loading cart...</p>
                </div>
            </div>
        );
    }

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
        if (window.confirm('Are you sure you want to remove this item?')) {
            try {
                await removeFromCart(itemId);
            } catch (error) {
                alert('Failed to remove item from cart');
            }
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                await clearCart();
            } catch (error) {
                alert('Failed to clear cart');
            }
        }
    };

    const handleCreateOrder = async () => {
        setOrdering(true);
        try {
            await orderAPI.createOrder();
            alert('Order created successfully!');
            navigate('/orders');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create order');
        } finally {
            setOrdering(false);
        }
    };

    if (cart.items.length === 0) {
        return (
            <div className="container cart-container">
                <div className="empty-state">
                    <h1 className="page-title">Your Cart</h1>
                    <p className="empty-state-text">Your cart is empty</p>
                    <button
                        onClick={() => navigate('/')}
                        className="add-to-cart-btn"
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
                <h1 className="page-title">Your Cart</h1>
                <button
                    onClick={handleClearCart}
                    className="clear-cart-btn"
                >
                    Clear Cart
                </button>
            </div>

            <div className="cart-items-container">
                {cart.items.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="cart-item-content">
                            <div className="item-details">
                                <h3 className="item-title">{item.book.title}</h3>
                                <p className="item-author">by {item.book.author}</p>
                                <p className="item-price">${item.book.price}</p>
                            </div>

                            <div className="item-controls">
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
                                        disabled={updating === item.id}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="item-total">
                                    <p className="item-price">${item.total_price}</p>
                                </div>

                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="remove-btn"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
                <div className="summary-row">
                    <span className="summary-total">Total:</span>
                    <span className="summary-total">${cart.total_price}</span>
                </div>
                <button
                    onClick={handleCreateOrder}
                    disabled={ordering}
                    className="checkout-btn"
                >
                    {ordering ? 'Creating Order...' : 'Proceed to Checkout'}
                </button>
            </div>
        </div>
    );
}

export default Cart;