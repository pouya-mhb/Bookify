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

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear user data on unauthorized
            localStorage.removeItem('user');
            window.location.href = '/login';
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

export const authAPI = {
    register: (userData) => api.post('/auth/register/', userData),
    login: (credentials) => api.post('/auth/login/', credentials),
    logout: () => api.post('/auth/logout/'),
    getCurrentUser: () => api.get('/auth/current-user/'),
};

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