import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CartMigration() {
    const { user } = useAuth();
    const { migrateGuestCartToUser } = useCart();

    useEffect(() => {
        if (user) {
            migrateGuestCartToUser(user.uid);
        }
    }, [user, migrateGuestCartToUser]);

    return null; // Este componente no renderiza nada
} 