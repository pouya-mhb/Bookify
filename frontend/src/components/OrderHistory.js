import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        try {
            const response = await orderAPI.getOrders();
            console.log('Orders API Response:', response);

            let ordersData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    ordersData = response.data;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    ordersData = response.data.results;
                } else if (typeof response.data === 'object') {
                    ordersData = [response.data];
                }
            }

            console.log('Processed orders data:', ordersData);
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            alert('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await orderAPI.cancelOrder(orderId);
                alert('Order cancelled successfully');
                loadOrders(); // Reload orders
            } catch (error) {
                alert(error.response?.data?.error || 'Failed to cancel order');
            }
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    const ordersArray = Array.isArray(orders) ? orders : [];

    if (loading) {
        return (
            <div className="container orders-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container orders-container">
            <div className="orders-header">
                <h1 className="page-title">Your Orders</h1>
                <button
                    onClick={() => navigate('/')}
                    className="continue-shopping-btn"
                >
                    Continue Shopping
                </button>
            </div>

            {!user ? (
                <div className="empty-state">
                    <p>Please log in to view your orders.</p>
                </div>
            ) : ordersArray.length === 0 ? (
                <div className="empty-state">
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="auth-button"
                        style={{ marginTop: '1rem' }}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {ordersArray.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Order #{order.id}</h3>
                                    <p className="order-date">
                                        Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="order-total-container">
                                    <p className="order-total">${order.total_price}</p>
                                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="order-items">
                                <h4>Order Items:</h4>
                                {order.order_items && order.order_items.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="order-item-details">
                                            <p className="item-title">{item.book?.title || 'Unknown Book'}</p>
                                            <p className="item-meta">
                                                Quantity: {item.quantity} × ${item.price} each
                                            </p>
                                        </div>
                                        <p className="item-subtotal">${(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {order.status === 'pending' && (
                                <div className="order-actions">
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="cancel-order-btn"
                                    >
                                        Cancel Order
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;