import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import BookCard from './BookCard';
import SearchFilters from './SearchFilters';

function BookList() {
    const { books, loading, searchBooks, applyFilters, sortBooks } = useApp();
    const [searchInput, setSearchInput] = useState('');

    // Add debugging
    useEffect(() => {
        console.log('Books data:', books);
        console.log('Books type:', typeof books);
        console.log('Is array?', Array.isArray(books));
    }, [books]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchInput !== '') {
                searchBooks(searchInput);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchInput, searchBooks]);

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    // Safe rendering - handle cases where books might not be an array
    const booksArray = Array.isArray(books) ? books : [];

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container book-list-container">
            <div className="page-title">Browse Books</div>

            {/* Search Box */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search books by title, author, or description..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="search-box"
                />
            </div>

            {/* Filters and Sort */}
            <SearchFilters onApplyFilters={applyFilters} onSort={sortBooks} />

            {/* Results Count */}
            <div className="results-count">
                Found {booksArray.length} books
            </div>

            {/* Book Grid */}
            <div className="book-grid">
                {booksArray.map(book => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>

            {booksArray.length === 0 && !loading && (
                <div className="empty-state">
                    <p>No books found. Try adjusting your search.</p>
                </div>
            )}
        </div>
    );
}

export default BookList;