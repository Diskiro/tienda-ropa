import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import debounce from 'lodash.debounce';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const stockCacheRef = useRef({});

    // Función para obtener el stock de un producto
    const getProductStock = async (productId, sizeKey) => {
        const cacheKey = `${productId}_${sizeKey.split('__')[1]}`;
        
        try {
            // Si tenemos el stock en caché, verificar si es reciente (menos de 5 segundos)
            if (stockCacheRef.current[cacheKey] !== undefined) {
                const cacheTimestamp = stockCacheRef.current[`${cacheKey}_timestamp`];
                if (cacheTimestamp && (Date.now() - cacheTimestamp) < 5000) {
                    return stockCacheRef.current[cacheKey];
                }
            }

            // Si no, obtener del servidor
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (!productDoc.exists()) {
                throw new Error('Producto no encontrado');
            }

            const productData = productDoc.data();
            const availableStock = productData.inventory?.[sizeKey] || 0;
            
            // Actualizar caché con timestamp
            stockCacheRef.current[cacheKey] = availableStock;
            stockCacheRef.current[`${cacheKey}_timestamp`] = Date.now();

            return availableStock;
        } catch (error) {
            console.error('Error al obtener stock:', error);
            throw error;
        }
    };

    // Función para actualizar el caché de stock
    const updateStockCache = (productId, size, newStock) => {
        const cacheKey = `${productId}_${size}`;
        stockCacheRef.current[cacheKey] = newStock;
        stockCacheRef.current[`${cacheKey}_timestamp`] = Date.now();
    };

    // Función debounceada para guardar el carrito
    const debouncedSaveCart = useCallback(
        debounce(async (cartData) => {
            try {
                if (user) {
                    await setDoc(doc(db, 'storeUsers', user.uid), {
                        cart: cartData,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                }
            } catch (error) {
                console.error('Error saving cart:', error);
                throw error;
            }
        }, 1000),
        [user]
    );

    const loadCart = useCallback(async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const cartRef = doc(db, 'storeUsers', user.uid);
            const cartDoc = await getDoc(cartRef);
            
            if (cartDoc.exists()) {
                setCart(cartDoc.data().cart || []);
            } else {
                setCart([]);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setCart([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            setCart([]);
            setLoading(false);
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

            // Obtener stock actualizado
            const availableStock = await getProductStock(productId, sizeKey);
            
            // Calcular la diferencia entre la cantidad actual y la nueva
            const quantityDifference = quantity - currentItem.quantity;
            
            // Verificar si hay suficiente stock para el cambio
            if (availableStock < quantityDifference) {
                throw new Error(`No hay suficiente stock disponible. Solo quedan ${availableStock} unidades.`);
            }

            // Verificar stock nuevamente antes de actualizar
            const finalStockCheck = await getProductStock(productId, sizeKey);
            if (finalStockCheck < quantityDifference) {
                throw new Error(`El stock ha cambiado. Solo quedan ${finalStockCheck} unidades.`);
            }

            // Actualizar el carrito
            const newCart = cart.map(item =>
                item.size === sizeKey
                    ? { ...item, quantity }
                    : item
            );

            setCart(newCart);
            
            // Actualizar la caché de stock
            updateStockCache(productId, size, availableStock - quantityDifference);
            
            // Guardar cambios en la base de datos
            await debouncedSaveCart(newCart);

            return true;
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    };

    const addToCart = async (product, size, quantity = 1) => {
        try {
            const sizeKey = `${product.id}__${size}`;
            const existingItemIndex = cart.findIndex(item => item.size === sizeKey);

            // Obtener stock actualizado
            const availableStock = await getProductStock(product.id, sizeKey);
            const currentCartQuantity = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0;
            const newTotalQuantity = currentCartQuantity + quantity;

            if (availableStock < newTotalQuantity) {
                throw new Error(`No hay suficiente stock disponible. Solo quedan ${availableStock} unidades.`);
            }

            // Verificar stock nuevamente antes de actualizar
            const finalStockCheck = await getProductStock(product.id, sizeKey);
            if (finalStockCheck < newTotalQuantity) {
                throw new Error(`El stock ha cambiado. Solo quedan ${finalStockCheck} unidades.`);
            }

            const newCart = [...cart];
            if (existingItemIndex >= 0) {
                newCart[existingItemIndex].quantity += quantity;
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
            
            // Actualizar la caché de stock
            updateStockCache(product.id, size, availableStock - quantity);
            
            // Guardar cambios en la base de datos
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
            const newCart = cart.filter(item => item.size !== sizeKey);
            
            setCart(newCart);
            if (itemToRemove) {
                await updateStockCache(productId, size, -itemToRemove.quantity);
            }
            debouncedSaveCart(newCart);
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            // Restaurar stock en caché
            const restoreStockPromises = cart.map(item => {
                const [productId, size] = item.size.split('__');
                return updateStockCache(productId, size, -item.quantity);
            });
            await Promise.all(restoreStockPromises);
            
        setCart([]);
            debouncedSaveCart([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

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
        getTotalItems,
        getTotalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
} 