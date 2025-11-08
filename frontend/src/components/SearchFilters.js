import React, { useState } from 'react';

function SearchFilters({ onApplyFilters, onSort }) {
    const [filters, setFilters] = useState({
        author: '',
        inStockOnly: false,
    });
    const [sortBy, setSortBy] = useState('title');

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onApplyFilters(newFilters);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        onSort(value);
    };

    return (
        <div className="filters-container">
            {/* Author Filter */}
            <div className="filter-group">
                <label className="filter-label">
                    Author
                </label>
                <input
                    type="text"
                    placeholder="Filter by author..."
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    className="filter-input"
                />
            </div>

            {/* In Stock Filter */}
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    id="inStockOnly"
                    checked={filters.inStockOnly}
                    onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                />
                <label htmlFor="inStockOnly" className="filter-label">
                    In stock only
                </label>
            </div>

            {/* Sort By */}
            <div className="filter-group">
                <label className="filter-label">
                    Sort by
                </label>
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="filter-input"
                >
                    <option value="title">Title</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-created_at">Newest First</option>
                </select>
            </div>
        </div>
    );
}

export default SearchFilters;