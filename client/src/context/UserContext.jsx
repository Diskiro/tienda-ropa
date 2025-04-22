import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function UserProvider({ children }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchFavorites();
            fetchOrders();
        } else {
            setUserData(null);
            setFavorites([]);
            setOrders([]);
            setLoading(false);
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const favoritesRef = collection(db, 'users', user.uid, 'favorites');
            const favoritesSnapshot = await getDocs(favoritesRef);
            const favoritesList = favoritesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFavorites(favoritesList);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('userId', '==', user.uid));
            const ordersSnapshot = await getDocs(q);
            const ordersList = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersList);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateUserData = async (data) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, data);
            setUserData(prev => ({ ...prev, ...data }));
            return true;
        } catch (error) {
            console.error('Error updating user data:', error);
            return false;
        }
    };

    const toggleFavorite = async (product) => {
        try {
            const favoriteRef = doc(db, 'users', user.uid, 'favorites', product.id);
            const favoriteDoc = await getDoc(favoriteRef);

            if (favoriteDoc.exists()) {
                await favoriteRef.delete();
                setFavorites(prev => prev.filter(item => item.id !== product.id));
            } else {
                await setDoc(favoriteRef, product);
                setFavorites(prev => [...prev, product]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(item => item.id === productId);
    };

    return (
        <UserContext.Provider value={{
            userData,
            favorites,
            orders,
            loading,
            updateUserData,
            toggleFavorite,
            isFavorite,
            fetchUserData,
            fetchFavorites,
            fetchOrders
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
} 