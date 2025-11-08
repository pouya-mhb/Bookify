// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import BookList from './components/BookList';
import BookDetails from './components/BookDetails';
import Cart from './components/Cart';
import OrderHistory from './components/OrderHistory';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<OrderHistory />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;