// src/components/BookDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useApp();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadBookDetails();
    }, [id]);

    const loadBookDetails = async () => {
        try {
            const response = await bookAPI.getBook(id);
            setBook(response.data);
        } catch (error) {
            console.error('Error loading book details:', error);
            alert('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (quantity < 1) return;

        setAddingToCart(true);
        try {
            await addToCart(book.id, quantity);
            alert('Book added to cart successfully!');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add book to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBackClick = () => {
        navigate(-1); // Go back to previous page
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="container book-details-container">
                <div className="empty-state">
                    <p>Book not found.</p>
                    <button onClick={handleBackClick} className="add-to-cart-btn">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container book-details-container">
            <button onClick={handleBackClick} className="back-button">
                ← Back to Books
            </button>

            <div className="book-details">
                <div className="book-details-content">
                    <div className="book-details-info">
                        <h1 className="book-details-title">{book.title}</h1>
                        <p className="book-details-author">by {book.author}</p>

                        <div className="book-details-price-stock">
                            <span className="book-details-price">${book.price}</span>
                            <span className={`stock-badge ${book.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                                {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                            </span>
                        </div>

                        <div className="book-details-description">
                            <h3>Description</h3>
                            <p>{book.description || 'No description available.'}</p>
                        </div>

                        {book.stock > 0 && (
                            <div className="book-details-actions">
                                <div className="quantity-controls">
                                    <label htmlFor="quantity">Quantity:</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={book.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="quantity-input"
                                    />
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className="add-to-cart-btn large"
                                >
                                    {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookDetails;