import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import debounce from 'lodash.debounce';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, handleLogout } = useAuth();
    const stockCacheRef = useRef({});

    // Función para obtener el stock de un producto
    const getProductStock = async (productId, sizeKey) => {
        try {
            // Obtener directamente de la base de datos
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (!productDoc.exists()) {
                throw new Error('Producto no encontrado');
            }

            const productData = productDoc.data();
            const availableStock = productData.inventory?.[sizeKey] || 0;
            
            return availableStock;
        } catch (error) {
            console.error('Error al obtener stock:', error);
            throw error;
        }
    };

    // Función para actualizar el stock en la base de datos
    const updateProductStock = async (productId, sizeKey, quantity) => {
        try {
            const productRef = doc(db, 'products', productId);
            const productDoc = await getDoc(productRef);
            
            if (!productDoc.exists()) {
                throw new Error('Producto no encontrado');
            }

            const currentStock = productDoc.data().inventory?.[sizeKey] || 0;
            const newStock = currentStock - quantity;

            if (newStock < 0) {
                throw new Error('No hay suficiente stock disponible');
            }

            await updateDoc(productRef, {
                [`inventory.${sizeKey}`]: newStock
            });

            console.log(`✅ Stock actualizado: ${productId} - ${sizeKey} = ${newStock}`);
        } catch (error) {
            console.error('❌ Error al actualizar stock:', error);
            throw error;
        }
    };

    // Función debounceada para guardar el carrito
    const debouncedSaveCart = useCallback(
        debounce(async (cartData) => {
            try {
                if (user) {
                    console.log('💾 Guardando carrito:', cartData);
                    await setDoc(doc(db, 'storeUsers', user.uid), {
                        cart: cartData,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                }
            } catch (error) {
                console.error('❌ Error guardando carrito:', error);
                throw error;
            }
        }, 1000),
        [user]
    );

    const loadCart = useCallback(async () => {
        if (!user) {
            return;
        }
        
        try {
            setLoading(true);
            const cartRef = doc(db, 'storeUsers', user.uid);
            const cartDoc = await getDoc(cartRef);
            
            if (cartDoc.exists()) {
                const cartData = cartDoc.data().cart || [];
                setCart(cartData);
            } else {
                setCart([]);
            }
        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadCart();
        }
    }, [user, loadCart]);

    const updateQuantity = async (productId, size, quantity) => {
        try {
            if (quantity <= 0) {
                removeFromCart(productId, size);
                return;
            }

            const sizeKey = `${productId}__${size}`;
            const currentItem = cart.find(item => item.size === sizeKey);
            
            if (!currentItem) {
                throw new Error('Producto no encontrado en el carrito');
            }

            // Calcular la diferencia entre la cantidad actual y la nueva
            const quantityDifference = quantity - currentItem.quantity;
            
            if (quantityDifference > 0) {
                // Si estamos aumentando la cantidad, verificar el stock disponible
                const availableStock = await getProductStock(productId, sizeKey);
                if (availableStock < quantityDifference) {
                    throw new Error(`No hay suficiente stock disponible. Solo quedan ${availableStock} unidades.`);
                }
                // Actualizar el inventario en la base de datos
                await updateDoc(doc(db, 'products', productId), {
                    [`inventory.${sizeKey}`]: increment(-quantityDifference)
                });
            } else if (quantityDifference < 0) {
                // Si estamos reduciendo la cantidad, devolver al inventario la diferencia exacta
                await updateDoc(doc(db, 'products', productId), {
                    [`inventory.${sizeKey}`]: increment(Math.abs(quantityDifference))
                });
            }

            // Actualizar el carrito
            const newCart = cart.map(item =>
                item.size === sizeKey
                    ? { ...item, quantity }
                    : item
            );

            setCart(newCart);
            await debouncedSaveCart(newCart);

            return true;
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    };

    const addToCart = async (product, size, quantity = 1) => {
        try {
            if (quantity <= 0) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            const sizeKey = `${product.id}__${size}`;
            const existingItemIndex = cart.findIndex(item => item.size === sizeKey);

            // Obtener stock actualizado directamente de la base de datos
            const availableStock = await getProductStock(product.id, sizeKey);
            const currentCartQuantity = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0;
            
            // Verificar si hay stock suficiente considerando lo que ya está en el carrito
            const realAvailableStock = availableStock + currentCartQuantity;
            const newTotalQuantity = currentCartQuantity + quantity;

            console.log('Stock en DB:', availableStock);
            console.log('Stock real disponible:', realAvailableStock);
            console.log('Cantidad en carrito:', currentCartQuantity);
            console.log('Nueva cantidad total:', newTotalQuantity);

            if (realAvailableStock <= 0) {
                throw new Error('El producto está agotado');
            }

            // Verificar si hay suficiente stock
            if (newTotalQuantity > realAvailableStock) {
                const disponibles = realAvailableStock - currentCartQuantity;
                throw new Error(`No hay suficiente stock disponible. Solo quedan ${disponibles} unidades disponibles.`);
            }

            // Actualizar el inventario en la base de datos
            await updateProductStock(product.id, sizeKey, quantity);

            // Actualizar el carrito
            const newCart = [...cart];
            if (existingItemIndex >= 0) {
                newCart[existingItemIndex].quantity = newTotalQuantity;
            } else {
                newCart.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    size: sizeKey,
                    quantity: quantity,
                    image: product.images?.[0] || '',
                    createdAt: new Date().toISOString()
                });
            }

            setCart(newCart);
            await debouncedSaveCart(newCart);

            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const removeFromCart = async (productId, size) => {
        try {
            const sizeKey = `${productId}__${size}`;
            const itemToRemove = cart.find(item => item.size === sizeKey);
            
            if (itemToRemove) {
                // Restaurar el inventario en la base de datos con la cantidad exacta
                const productRef = doc(db, 'products', productId);
                await updateDoc(productRef, {
                    [`inventory.${sizeKey}`]: increment(itemToRemove.quantity)
                });
            }

            const newCart = cart.filter(item => item.size !== sizeKey);
            setCart(newCart);
            debouncedSaveCart(newCart);
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const clearCartInDatabase = useCallback(async () => {
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            throw new Error('No hay usuario autenticado');
        }

        try {
            // Primero restaurar el stock de todos los productos en el carrito
            console.log('🔄 Restaurando stock de productos...');
            console.log('📦 Productos en carrito antes de limpiar:', cart);
            
            if (cart.length === 0) {
                console.log('⚠️ El carrito ya está vacío, no hay stock que restaurar');
                return;
            }

            const restoreStockPromises = cart.map(async (item) => {
                const [productId, size] = item.size.split('__');
                const productRef = doc(db, 'products', productId);
                
                console.log(`📥 Restaurando ${item.quantity} unidades al producto ${productId} talla ${size}`);
                console.log(`🔍 Detalles del item:`, item);
                
                // Obtener el stock actual
                const productDoc = await getDoc(productRef);
                if (!productDoc.exists()) {
                    console.error(`❌ Producto ${productId} no encontrado`);
                    return;
                }
                
                const currentStock = productDoc.data().inventory?.[item.size] || 0;
                const newStock = currentStock + item.quantity;
                
                console.log(`📊 Stock actual: ${currentStock}, Nuevo stock: ${newStock}`);
                
                // Actualizar el stock
                await updateDoc(productRef, {
                    [`inventory.${item.size}`]: newStock
                });
                
                console.log(`✅ Stock actualizado para ${productId} talla ${size}`);
            });
            
            // Esperar a que todas las actualizaciones de stock se completen
            await Promise.all(restoreStockPromises);
            console.log('✅ Stock restaurado exitosamente');

            // Luego eliminar el carrito de la base de datos
            const userRef = doc(db, 'storeUsers', user.uid);
            await updateDoc(userRef, {
                cart: [],
                updatedAt: new Date().toISOString()
            });

            // Actualizar el estado local
            setCart([]);
            console.log('✅ Carrito eliminado en la base de datos y estado local actualizado');
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar el carrito en la base de datos:', error);
            throw error;
        }
    }, [user, cart]);

    const clearCart = async () => {
        try {
            // Restaurar stock en la base de datos
            const restoreStockPromises = cart.map(async (item) => {
                const [productId, size] = item.size.split('__');
                const productRef = doc(db, 'products', productId);
                
                // Devolver exactamente la misma cantidad que estaba en el carrito
                await updateDoc(productRef, {
                    [`inventory.${item.size}`]: increment(item.quantity)
                });
            });
            
            await Promise.all(restoreStockPromises);
            
            // Limpiar el carrito en la base de datos
            await clearCartInDatabase();
            
            // Actualizar el estado local
            setCart([]);
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            throw error;
        }
    };

    const clearCartForInactivity = useCallback(async () => {
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            return;
        }

        try {
            // Obtener el carrito actual
            const userRef = doc(db, 'storeUsers', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                console.log('❌ Usuario no encontrado');
                return;
            }

            const userData = userDoc.data();
            const cart = userData.cart || [];

            // Restaurar el stock de cada producto en el carrito
            for (const item of cart) {
                const productRef = doc(db, 'products', item.productId);
                
                console.log(`📥 Restaurando ${item.quantity} unidades al producto ${item.productId} talla ${item.size}`);
                
                // Obtener el stock actual
                const productDoc = await getDoc(productRef);
                if (!productDoc.exists()) {
                    console.error(`❌ Producto ${item.productId} no encontrado`);
                    continue;
                }

                // Actualizar el stock de la talla específica
                await updateDoc(productRef, {
                    [`inventory.${item.size}`]: increment(item.quantity)
                });
            }
            
            // Limpiar el carrito en la base de datos
            await updateDoc(userRef, {
                cart: []
            });

            // Actualizar el estado local
            setCart([]);
            console.log('✅ Carrito limpiado por inactividad exitosamente');
        } catch (error) {
            console.error('❌ Error al limpiar el carrito por inactividad:', error);
            throw error;
        }
    }, [user]);

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearCartInDatabase,
        clearCartForInactivity,
        loadCart,
        getTotalItems,
        getTotalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
} 