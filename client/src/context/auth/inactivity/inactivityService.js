import { INACTIVITY_TIMEOUT, LOG_MESSAGES } from './constants';

export const checkInactivity = async (lastActivity, user, onLogout) => {
    const currentTime = Date.now();
    const lastActivityLS = parseInt(localStorage.getItem('lastActivity') || currentTime);

    if (currentTime - lastActivityLS > INACTIVITY_TIMEOUT && user) {
        try {
            if (onLogout) {
                await onLogout();
            }
            return true; // Indica que se debe cerrar la sesión
        } catch (error) {
            console.error('Error durante el proceso de cierre de sesión:', error);
            return false;
        }
    }
    return false;
};

export const updateLastActivity = () => {
    const now = Date.now();
    localStorage.setItem('lastActivity', now.toString());
    console.log('📝 Última actividad actualizada:', new Date(now).toLocaleTimeString());
    return now;
};

export const clearCartAndLogout = async (onLogout) => {
    try {
        // Solo cerrar la sesión
        console.log(LOG_MESSAGES.LOGGING_OUT);
        await onLogout();
        console.log('✅ Sesión cerrada exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error durante el proceso de cierre de sesión:', error);
        return false;
    }
}; 