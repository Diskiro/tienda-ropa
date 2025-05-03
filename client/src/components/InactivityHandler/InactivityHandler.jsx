import { useEffect } from 'react';
import { useAuth } from '../../context/auth/useAuth';

const InactivityHandler = () => {
    const { handleActivity } = useAuth();

    useEffect(() => {
        // El monitoreo de inactividad ya está manejado por el hook useInactivity
        // No necesitamos hacer nada aquí, solo exponer handleActivity
        return () => {
            // Limpieza si es necesaria
        };
    }, []);

    return null; // Este componente no renderiza nada
};

export default InactivityHandler; 