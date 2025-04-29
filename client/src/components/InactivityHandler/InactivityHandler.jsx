import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function InactivityHandler() {
    const { setOnInactivityLogout } = useAuth();
    const { clearCartInDatabase } = useCart();

    useEffect(() => {
        const handleInactivity = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    await clearCartInDatabase();
                    resolve();
                } catch (error) {
                    console.error('Error al limpiar el carrito por inactividad:', error);
                    reject(error);
                }
            });
        };

        setOnInactivityLogout(() => handleInactivity);

        return () => {
            setOnInactivityLogout(null);
        };
    }, [setOnInactivityLogout, clearCartInDatabase]);

    return null;
} 