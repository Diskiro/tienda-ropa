import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import GlobalStyles from './globalStyles';
import Layout from './components/Layout/Layout';
import HomePage from './pages/Home/HomePage';
import Catalog from './pages/Catalog/Catalog';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import User from './pages/User/User';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles />
            <AuthProvider>
                <CartProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/catalogo" element={<Catalog />} />
                                <Route path="/producto/:id" element={<Product />} />
                                <Route path="/carrito" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/usuario" element={<User />} />
                                <Route path="/pedido/:id" element={<OrderDetail />} />
                            </Routes>
                        </Layout>
                    </Router>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 