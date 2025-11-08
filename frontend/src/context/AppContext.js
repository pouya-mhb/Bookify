import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI, bookAPI } from '../services/api';

const AppContext = createContext();

const initialState = {
    books: [], // Ensure this starts as an array
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
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_BOOKS':
            // Ensure we always set an array
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

    // Load books on component mount
    useEffect(() => {
        loadBooks();
        loadCart();
    }, []);

    const loadBooks = async (params = {}) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await bookAPI.getBooks(params);
            console.log('API Response:', response); // Debug log

            // Handle different response structures
            let booksData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    booksData = response.data;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    // Handle paginated response
                    booksData = response.data.results;
                } else if (typeof response.data === 'object') {
                    // Handle case where response.data might be an object instead of array
                    booksData = Object.values(response.data);
                }
            }

            console.log('Processed books data:', booksData); // Debug log
            dispatch({ type: 'SET_BOOKS', payload: booksData });
        } catch (error) {
            console.error('Error loading books:', error);
            // Set empty array on error
            dispatch({ type: 'SET_BOOKS', payload: [] });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const loadCart = async () => {
        try {
            const response = await cartAPI.getCart();
            dispatch({ type: 'SET_CART', payload: response.data });
        } catch (error) {
            console.error('Error loading cart:', error);
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
        try {
            await cartAPI.addToCart(bookId, quantity);
            await loadCart(); // Reload cart to get updated data
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
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