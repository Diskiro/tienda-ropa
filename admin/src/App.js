import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import UploadProducts from './pages/UploadProducts';
import Users from './pages/Users';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
            <AuthProvider>
      <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="users" element={<Users />} />
                        </Route>
                        <Route
                            path="/upload"
                            element={
                                <ProtectedRoute>
        <Layout>
                                        <UploadProducts />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
          </Routes>
      </Router>
            </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
