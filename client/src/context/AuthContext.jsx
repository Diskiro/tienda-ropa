import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [onInactivityLogout, setOnInactivityLogout] = useState(null);
    const inactivityIntervalRef = useRef(null);

    // Función para actualizar la última actividad
    const updateLastActivity = useCallback(() => {
        const now = Date.now();
        setLastActivity(now);
        localStorage.setItem('lastActivity', now.toString());
    }, []);

    // Función para verificar la inactividad
    const checkInactivity = useCallback(async () => {
        // Si no hay usuario logueado, no verificar inactividad
        if (!user) {
            if (inactivityIntervalRef.current) {
                clearInterval(inactivityIntervalRef.current);
                inactivityIntervalRef.current = null;
            }
            return;
        }

        const currentTime = Date.now();
        const lastActivityLS = parseInt(localStorage.getItem('lastActivity') || currentTime);
        const oneHour = 30 * 60 * 1000; // 30 minutos

        if (currentTime - lastActivityLS > oneHour) {
            // Limpiar el intervalo para evitar múltiples ejecuciones
            if (inactivityIntervalRef.current) {
                clearInterval(inactivityIntervalRef.current);
                inactivityIntervalRef.current = null;
            }

            console.log('Iniciando proceso de cierre de sesión por inactividad');
            try {
                // Llamar a la función registrada que limpiará el carrito
                if (onInactivityLogout) {
                    await onInactivityLogout();
                }
                // Proceder con el cierre de sesión
                await auth.signOut();
                setUser(null);
                saveUserToLocalStorage(null);
                localStorage.removeItem('lastActivity');
                setAlert({
                    open: true,
                    message: 'Tu sesión ha expirado por inactividad.',
                    severity: 'warning'
                });
            } catch (error) {
                console.error('Error durante el proceso de cierre de sesión:', error);
                localStorage.setItem('lastActivity', currentTime.toString());
                startInactivityCheck();
            }
        }
    }, [user, onInactivityLogout]);

    // Función para iniciar el chequeo de inactividad
    const startInactivityCheck = useCallback(() => {
        if (inactivityIntervalRef.current) {
            clearInterval(inactivityIntervalRef.current);
        }
        inactivityIntervalRef.current = setInterval(checkInactivity, 1000);
    }, [checkInactivity]);

    // Efecto para manejar la actividad del usuario
    useEffect(() => {
        if (user) {
            const handleActivity = (event) => {
                // Verificar si el click fue en un botón o link
                const target = event.target;
                const isButton = target.tagName === 'BUTTON' || target.closest('button');
                const isLink = target.tagName === 'A' || target.closest('a');
                const isInput = target.tagName === 'INPUT' || target.closest('input');
                
                if (isButton || isLink || isInput) {
                    updateLastActivity();
                }
            };
            
            window.addEventListener('click', handleActivity);
            window.addEventListener('keydown', handleActivity);
            
            startInactivityCheck();

            return () => {
                window.removeEventListener('click', handleActivity);
                window.removeEventListener('keydown', handleActivity);
                if (inactivityIntervalRef.current) {
                    clearInterval(inactivityIntervalRef.current);
                    inactivityIntervalRef.current = null;
                }
            };
        }
    }, [user, updateLastActivity, startInactivityCheck]);

    // Efecto para cargar el usuario inicial
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const saveUserToLocalStorage = useCallback((userData) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    }, []);

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
        localStorage.removeItem('lastActivity');
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
        closeAlert,
        setOnInactivityLogout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 