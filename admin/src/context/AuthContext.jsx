import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        // Verificar si hay un usuario en localStorage
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Buscar el usuario en adminUsers
            const adminUsersQuery = query(
                collection(db, 'adminUsers'),
                where('email', '==', email)
            );
            const adminUsersSnapshot = await getDocs(adminUsersQuery);
            
            if (!adminUsersSnapshot.empty) {
                const adminUserDoc = adminUsersSnapshot.docs[0];
                const adminUserData = adminUserDoc.data();
                
                // Verificar la contraseña
                if (adminUserData.password === password) {
                    const userData = {
                        id: adminUserDoc.id,
                        email: adminUserData.email,
                        role: 'admin'
                    };
                    
                    // Guardar en localStorage
                    localStorage.setItem('adminUser', JSON.stringify(userData));
                    setUser(userData);
                    
                    return userData;
                }
            }

            setAlert({
                open: true,
                message: 'Credenciales inválidas',
                severity: 'error'
            });
            return null;
        } catch (error) {
            console.error('Login error:', error);
            setAlert({
                open: true,
                message: 'Error al iniciar sesión',
                severity: 'error'
            });
            return null;
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('adminUser');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            setAlert({
                open: true,
                message: 'Error al cerrar sesión',
                severity: 'error'
            });
        }
    };

    const closeAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const value = {
        user,
        loading,
        login,
        logout,
        alert,
        closeAlert
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 