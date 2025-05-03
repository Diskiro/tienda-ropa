import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth } from '../../firebase';

export const loginService = async (email, password) => {
    try {
        const usersQuery = query(
            collection(db, 'storeUsers'),
            where('email', '==', email)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc.data();
            
            if (userData.password === password) {
                return {
                    uid: userDoc.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phone: userData.phone,
                    metroStation: userData.metroStation,
                    role: userData.role
                };
            }
        }
        throw new Error('Credenciales inválidas');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

export const registerService = async (userData) => {
    try {
        const usersQuery = query(
            collection(db, 'storeUsers'),
            where('email', '==', userData.email)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
            throw new Error('El email ya está registrado');
        }

        const newUser = {
            ...userData,
            createdAt: new Date().toISOString(),
            role: 'customer'
        };

        const docRef = await addDoc(collection(db, 'storeUsers'), newUser);
        
        return {
            uid: docRef.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
            metroStation: newUser.metroStation,
            role: newUser.role
        };
    } catch (error) {
        console.error('Error al registrar:', error);
        throw error;
    }
};

export const logoutService = async () => {
    try {
        await auth.signOut();
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
};

export const saveUserToLocalStorage = (userData) => {
    if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    } else {
        localStorage.removeItem('user');
    }
};

export const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
}; 