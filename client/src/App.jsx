import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/Home/HomePage';
import CatalogPage from './pages/Catalog/Catalog';
import ProductPage from './pages/Product/Product';
import CartPage from './pages/Cart/Cart';
import CheckoutPage from './pages/Checkout/Checkout';
import { LoginPage } from './pages/Login/Login';
import { RegisterPage } from './pages/Register/Register';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartMigration from './components/CartMigration/CartMigration';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <CartProvider>
                    <Router>
                        <Header />
                        <main style={{ minHeight: 'calc(100vh - 128px)' }}>
                            <CartMigration />
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/catalogo" element={<CatalogPage />} />
                                <Route path="/producto/:id" element={<ProductPage />} />
                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/checkout" element={<CheckoutPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                            </Routes>
                        </main>
                        <Footer />
                    </Router>
                </CartProvider>
            </AuthProvider>
            <Toaster position="bottom-right" />
        </ThemeProvider>
    );
}

export default App; 