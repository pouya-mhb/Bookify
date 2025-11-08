// src/components/BookCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function BookCard({ book }) {
    const { addToCart } = useApp();
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const handleCardClick = () => {
        navigate(`/books/${book.id}`);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Prevent card click when clicking the button

        if (quantity < 1) return;

        setAdding(true);
        try {
            await addToCart(book.id, quantity);
            alert('Book added to cart successfully!');
            setQuantity(1);
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add book to cart');
        } finally {
            setAdding(false);
        }
    };

    const handleQuantityChange = (e) => {
        e.stopPropagation(); // Prevent card click when changing quantity
        setQuantity(parseInt(e.target.value) || 1);
    };

    return (
        <div className="book-card" onClick={handleCardClick}>
            <div className="book-card-content">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-description">{book.description}</p>

                <div className="book-price-stock">
                    <span className="book-price">${book.price}</span>
                    <span className={`stock-badge ${book.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                        {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                    </span>
                </div>

                {book.stock > 0 && (
                    <div className="quantity-controls" onClick={e => e.stopPropagation()}>
                        <input
                            type="number"
                            min="1"
                            max={book.stock}
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="quantity-input"
                        />
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="add-to-cart-btn"
                        >
                            {adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookCard;