import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const { user } = useAuth();

    // Cargar favoritos cuando el usuario inicia sesión
    useEffect(() => {
        const loadFavorites = async () => {
            if (user?.uid) {
                const userDoc = await getDoc(doc(db, 'storeUsers', user.uid));
                if (userDoc.exists()) {
                    setFavorites(userDoc.data().favorites || []);
                }
            } else {
                setFavorites([]);
            }
        };

        loadFavorites();
    }, [user]);

    const addToFavorites = async (product) => {
        if (!user) {
            throw new Error('Debes iniciar sesión para agregar a favoritos');
        }

        try {
            const userRef = doc(db, 'storeUsers', user.uid);
            await updateDoc(userRef, {
                favorites: arrayUnion(product)
            });
            setFavorites(prev => [...prev, product]);
            return true;
        } catch (error) {
            console.error('Error al agregar a favoritos:', error);
            throw new Error('Error al agregar a favoritos');
        }
    };

    const removeFromFavorites = async (product) => {
        if (!user) {
            throw new Error('Debes iniciar sesión para eliminar de favoritos');
        }

        try {
            const userRef = doc(db, 'storeUsers', user.uid);
            await updateDoc(userRef, {
                favorites: arrayRemove(product)
            });
            setFavorites(prev => prev.filter(fav => fav.id !== product.id));
            return true;
        } catch (error) {
            console.error('Error al eliminar de favoritos:', error);
            throw new Error('Error al eliminar de favoritos');
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(fav => fav.id === productId);
    };

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}; 