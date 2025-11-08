import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI, bookAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const initialState = {
    books: [],
    cart: null,
    loading: false,
    searchQuery: '',
    filters: {
        author: '',
        inStockOnly: false,
    },
    sortBy: 'title',
};

function appReducer(state, action) {
    console.log('AppReducer - Action:', action.type, 'Payload:', action.payload);
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_BOOKS':
            return {
                ...state,
                books: Array.isArray(action.payload) ? action.payload : []
            };
        case 'SET_CART':
            return { ...state, cart: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_SORT_BY':
            return { ...state, sortBy: action.payload };
        case 'UPDATE_CART_ITEM':
            const updatedItems = state.cart.items.map(item =>
                item.id === action.payload.id ? action.payload : item
            );
            return {
                ...state,
                cart: { ...state.cart, items: updatedItems }
            };
        case 'REMOVE_CART_ITEM':
            const filteredItems = state.cart.items.filter(item => item.id !== action.payload);
            return {
                ...state,
                cart: { ...state.cart, items: filteredItems }
            };
        case 'CLEAR_CART':
            return {
                ...state,
                cart: { ...state.cart, items: [] }
            };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { user } = useAuth();

    console.log('AppProvider - Current state:', state);
    console.log('AppProvider - User:', user);

    // Load books on component mount
    useEffect(() => {
        loadBooks();
    }, []);

    // Load cart when user changes
    useEffect(() => {
        if (user) {
            console.log('User changed, loading cart...');
            loadCart();
        } else {
            console.log('No user, clearing cart');
            dispatch({ type: 'SET_CART', payload: null });
        }
    }, [user]);

    const loadBooks = async (params = {}) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await bookAPI.getBooks(params);
            console.log('Books API response:', response);

            let booksData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    booksData = response.data;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    booksData = response.data.results;
                } else if (typeof response.data === 'object') {
                    booksData = Object.values(response.data);
                }
            }

            dispatch({ type: 'SET_BOOKS', payload: booksData });
        } catch (error) {
            console.error('Error loading books:', error);
            dispatch({ type: 'SET_BOOKS', payload: [] });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const loadCart = async (params = {}) => {
        if (!user) {
            console.log('No user, skipping cart load');
            return;
        }

        try {
            console.log('Loading cart for user:', user.username);
            const response = await cartAPI.getCart(params);
            console.log('Cart API response:', response);
            dispatch({ type: 'SET_CART', payload: response.data });
        } catch (error) {
            console.error('Error loading cart:', error);
            if (error.response?.status === 404) {
                console.log('Cart not found, creating empty cart structure');
                // Set empty cart structure
                dispatch({
                    type: 'SET_CART',
                    payload: {
                        id: null,
                        items: [],
                        total_price: '0.00',
                        total_items: 0
                    }
                });
            } else {
                console.log('Other error, setting cart to null');
                dispatch({ type: 'SET_CART', payload: null });
            }
        }
    };

    const searchBooks = async (query) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        await loadBooks({ search: query, ...state.filters, ordering: state.sortBy });
    };

    const applyFilters = async (filters) => {
        const newFilters = { ...state.filters, ...filters };
        dispatch({ type: 'SET_FILTERS', payload: newFilters });
        await loadBooks({
            search: state.searchQuery,
            ...newFilters,
            ordering: state.sortBy
        });
    };

    const sortBooks = async (sortBy) => {
        dispatch({ type: 'SET_SORT_BY', payload: sortBy });
        await loadBooks({
            search: state.searchQuery,
            ...state.filters,
            ordering: sortBy
        });
    };

    const addToCart = async (bookId, quantity = 1) => {
        if (!user) {
            throw new Error('Please login to add items to cart');
        }

        try {
            console.log('Adding to cart - Book ID:', bookId, 'Quantity:', quantity);
            const response = await cartAPI.addToCart(bookId, quantity);
            console.log('Add to cart response:', response);

            // Reload the cart to get updated data
            await loadCart();
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            console.error('Error response data:', error.response?.data);

            // More specific error handling
            if (error.response?.data?.cart) {
                throw new Error('Cart issue: ' + error.response.data.cart[0]);
            }
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            }
            throw new Error('Failed to add book to cart');
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const response = await cartAPI.updateCartItem(itemId, quantity);
            dispatch({ type: 'UPDATE_CART_ITEM', payload: response.data });
            return true;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await cartAPI.removeFromCart(itemId);
            dispatch({ type: 'REMOVE_CART_ITEM', payload: itemId });
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clearCart();
            dispatch({ type: 'CLEAR_CART' });
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };

    const value = {
        ...state,
        loadBooks,
        loadCart,
        searchBooks,
        applyFilters,
        sortBooks,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};