import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FavoritesProvider } from '../../context/FavoritesContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <FavoritesProvider>
            {children}
        </FavoritesProvider>
    );
}

export default ProtectedRoute; 