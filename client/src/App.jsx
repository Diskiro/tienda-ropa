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
import EditProfile from './pages/Profile/EditProfile';
import NotFound from './pages/NotFound/NotFound';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import About from './pages/About/About';
import Accessories from './pages/Accessories/Accessories';

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
                                <Route path="/profile/edit" element={<EditProfile />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/accessories" element={<Accessories />} />
                                <Route path="*" element={<NotFound />} />
                                    </Routes>
                        </Layout>
                        </Router>
                    </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 