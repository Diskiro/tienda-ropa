import React, { createContext, useContext, useState, useEffect } from 'react';

import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Intentar recuperar el usuario del localStorage al inicializar
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    // Función para guardar el usuario en localStorage
    const saveUserToLocalStorage = (userData) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    // Verificar y restaurar la sesión al cargar la aplicación
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    // Verificar que el usuario aún existe en Firestore
                    const userDoc = await getDoc(doc(db, 'storeUsers', userData.id));
                    if (userDoc.exists()) {
                        setUser({
                            id: userDoc.id,
                            ...userDoc.data()
                        });
                    } else {
                        // Si el usuario no existe en Firestore, limpiar la sesión
                        setUser(null);
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                console.error('Error al restaurar la sesión:', error);
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            // Buscar el usuario en la colección storeUsers
            const usersRef = collection(db, 'storeUsers');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error('Usuario no encontrado');
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Verificar la contraseña
            if (userData.password !== password) {
                throw new Error('Contraseña incorrecta');
            }

            // Crear el objeto de usuario
            const userObject = {
                id: userDoc.id,
                ...userData
            };

            // Establecer el usuario en el estado y guardar en localStorage
            setUser(userObject);
            saveUserToLocalStorage(userObject);

            setAlert({
                open: true,
                message: 'Inicio de sesión exitoso',
                severity: 'success'
            });

            return true;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setAlert({
                open: true,
                message: error.message || 'Error al iniciar sesión',
                severity: 'error'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            // Verificar si el email ya existe
            const usersRef = collection(db, 'storeUsers');
            const q = query(usersRef, where('email', '==', userData.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                throw new Error('El correo electrónico ya está registrado');
            }

            // Crear el nuevo usuario
            const newUserRef = await addDoc(collection(db, 'storeUsers'), {
                ...userData,
                createdAt: new Date().toISOString()
            });

            // Crear el objeto de usuario
            const userObject = {
                id: newUserRef.id,
                ...userData
            };

            // Establecer el usuario en el estado y guardar en localStorage
            setUser(userObject);
            saveUserToLocalStorage(userObject);

            setAlert({
                open: true,
                message: 'Registro exitoso',
                severity: 'success'
            });

            return newUserRef.id;
        } catch (error) {
            console.error('Error al registrar:', error);
            setAlert({
                open: true,
                message: error.message || 'Error al registrar usuario',
                severity: 'error'
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateUserData = async (userId, userData) => {
        try {
            await updateDoc(doc(db, 'storeUsers', userId), userData);
            setUser(prev => ({ ...prev, ...userData }));
            setAlert({
                open: true,
                message: 'Datos actualizados correctamente',
                severity: 'success'
            });
            return true;
        } catch (error) {
            console.error('Error updating user data:', error);
            setAlert({
                open: true,
                message: 'Error al actualizar los datos',
                severity: 'error'
            });
            return false;
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
        updateUserData,
        alert,
        closeAlert
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 