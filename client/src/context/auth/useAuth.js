import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '../AuthContext';
import { loginService, registerService, logoutService, saveUserToLocalStorage } from './authService';
import { useInactivity } from './inactivity/useInactivity';

export const useAuth = () => {
    const { user, setUser, alert, setAlert, closeAlert } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const handleLogout = useCallback(async () => {
        try {
            await logoutService();
            setUser(null);
            saveUserToLocalStorage(null);
            setAlert({
                open: true,
                message: 'Sesión cerrada correctamente',
                severity: 'success'
            });
        } catch (error) {
            setAlert({
                open: true,
                message: 'Error al cerrar sesión',
                severity: 'error'
            });
        }
    }, [setUser, setAlert]);

    // Inicializar el monitoreo de inactividad
    const { handleActivity } = useInactivity(user, handleLogout);

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const userData = await loginService(email, password);
            setUser(userData);
            saveUserToLocalStorage(userData);
            setAlert({
                open: true,
                message: 'Inicio de sesión exitoso',
                severity: 'success'
            });
            return userData;
        } catch (error) {
            setAlert({
                open: true,
                message: error.message,
                severity: 'error'
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [setUser, setAlert]);

    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            const newUser = await registerService(userData);
            setUser(newUser);
            saveUserToLocalStorage(newUser);
            setAlert({
                open: true,
                message: 'Registro exitoso',
                severity: 'success'
            });
            return newUser;
        } catch (error) {
            setAlert({
                open: true,
                message: error.message,
                severity: 'error'
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [setUser, setAlert]);

    return {
        user,
        loading,
        login,
        register,
        logout: handleLogout,
        alert,
        setAlert,
        closeAlert,
        handleActivity
    };
}; 