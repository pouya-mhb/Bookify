import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
    (config) => {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response); // Debug log
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            console.error('Unauthorized access - please log in');
        }
        if (error.response?.status === 403) {
            console.error('CSRF verification failed');
        }
        if (error.response?.status === 404) {
            console.error('API endpoint not found');
        }
        if (error.response?.status === 500) {
            console.error('Server error');
        }
        return Promise.reject(error);
    }
);

// Helper function to get CSRF token from cookies
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// In your existing services/api.js
export const bookAPI = {
    getBooks: (params = {}) => api.get('/books/', { params }),
    getBook: (id) => api.get(`/books/${id}/`),
    searchBooks: (query) => api.get('/books/', { params: { search: query } }),
};
export const cartAPI = {
    getCart: () => api.get('/carts/'),
    addToCart: (bookId, quantity = 1) =>
        api.post('/cart-items/', { book_id: bookId, quantity }),
    updateCartItem: (itemId, quantity) =>
        api.patch(`/cart-items/${itemId}/`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart-items/${itemId}/`),
    clearCart: () => api.post('/cart-items/clear_cart/'),
};

export const orderAPI = {
    getOrders: () => api.get('/orders/'),
    createOrder: () => api.post('/orders/'),
    cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel_order/`),
};

export default api;
