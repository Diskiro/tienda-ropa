import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Función para actualizar la última actividad
    const updateLastActivity = () => {
        setLastActivity(Date.now());
    };

    // Función para verificar la inactividad
    const checkInactivity = () => {
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActivity;
        const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos

        if (inactiveTime >= oneHour && user) {
            logout();
            setAlert({
                open: true,
                message: 'Tu sesión ha expirado por inactividad',
                severity: 'warning'
            });
        }
    };

    // Agregar event listeners para detectar actividad
    useEffect(() => {
        if (user) {
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            
            const handleActivity = () => {
                updateLastActivity();
            };

            events.forEach(event => {
                window.addEventListener(event, handleActivity);
            });

            // Verificar inactividad cada minuto
            const inactivityInterval = setInterval(checkInactivity, 60000);

            return () => {
                events.forEach(event => {
                    window.removeEventListener(event, handleActivity);
                });
                clearInterval(inactivityInterval);
            };
        }
    }, [user]);

    useEffect(() => {
        // Verificar si hay un usuario en localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const saveUserToLocalStorage = (userData) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    const login = async (email, password) => {
        try {
            // Buscar el usuario en storeUsers
            const usersQuery = query(
                collection(db, 'storeUsers'),
                where('email', '==', email)
            );
            const usersSnapshot = await getDocs(usersQuery);
            
            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                const userData = userDoc.data();
                
                // Verificar la contraseña
                if (userData.password === password) {
                    const userToStore = {
                        uid: userDoc.id,
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        phone: userData.phone,
                        metroStation: userData.metroStation,
                        role: userData.role
                    };
                    
                    setUser(userToStore);
                    saveUserToLocalStorage(userToStore);
                    setAlert({
                        open: true,
                        message: 'Inicio de sesión exitoso',
                        severity: 'success'
                    });
                    return userToStore;
                }
            }

            setAlert({
                open: true,
                message: 'Credenciales inválidas',
                severity: 'error'
            });
            return null;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setAlert({
                open: true,
                message: 'Error al iniciar sesión: ' + error.message,
                severity: 'error'
            });
            return null;
        }
    };

    const register = async (userData) => {
        try {
            // Verificar si el email ya existe
            const usersQuery = query(
                collection(db, 'storeUsers'),
                where('email', '==', userData.email)
            );
            const usersSnapshot = await getDocs(usersQuery);
            
            if (!usersSnapshot.empty) {
                setAlert({
                    open: true,
                    message: 'El email ya está registrado',
                    severity: 'error'
                });
                return null;
            }

            // Crear nuevo usuario en storeUsers
            const newUser = {
                ...userData,
                createdAt: new Date().toISOString(),
                role: 'customer'
            };

            const docRef = await addDoc(collection(db, 'storeUsers'), newUser);
            
            const userToStore = {
                uid: docRef.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                metroStation: newUser.metroStation,
                role: newUser.role
            };

            setUser(userToStore);
            saveUserToLocalStorage(userToStore);
            setAlert({
                open: true,
                message: 'Registro exitoso',
                severity: 'success'
            });
            return userToStore;
        } catch (error) {
            console.error('Error al registrar:', error);
            setAlert({
                open: true,
                message: 'Error al registrar: ' + error.message,
                severity: 'error'
            });
            return null;
        }
    };

    const logout = () => {
        setUser(null);
        saveUserToLocalStorage(null);
        setAlert({
            open: true,
            message: 'Sesión cerrada correctamente',
            severity: 'success'
        });
    };

    const closeAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        alert,
        closeAlert
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 