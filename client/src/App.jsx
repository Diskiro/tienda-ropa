import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import './App.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <UserProvider>
                    <CartProvider>
                        <Router>
                            <div className="App">
                                <Header />
                                <main className="main-content">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/catalogo" element={<Catalog />} />
                                        <Route path="/producto/:id" element={<Product />} />
                                        <Route path="/cart" element={<Cart />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/checkout" element={<Checkout />} />
                                    </Routes>
                                </main>
                                <Footer />
                            </div>
                        </Router>
                    </CartProvider>
                </UserProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 