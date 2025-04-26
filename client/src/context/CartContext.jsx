import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import debounce from 'lodash.debounce';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stockCache, setStockCache] = useState({});
    const stockCacheRef = useRef({});
    const pendingUpdates = useRef([]);

    // Generar un ID único para el carrito de invitado
    const getGuestCartId = () => {
        let guestCartId = localStorage.getItem('guestCartId');
        if (!guestCartId) {
            guestCartId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('guestCartId', guestCartId);
        }
        return guestCartId;
    };

    // Validar y limpiar los datos del carrito
    const cleanCartData = (cartItems) => {
        if (!Array.isArray(cartItems)) {
            console.warn('cleanCartData received non-array:', cartItems);
            return [];
        }
        return cartItems.map(item => {
            let productId = item.productId;
            if (!productId && item.size && item.size.includes('__')) {
                productId = item.size.split('__')[0];
            }

            return {
                id: item.id || '',
                productId: productId || '',
                name: item.name || 'Nombre no disponible',
                price: item.price || 0,
                image: item.image || '',
                size: item.size || '',
                quantity: item.quantity || 1,
                createdAt: item.createdAt || new Date().toISOString()
            };
        }).filter(item => item.productId && item.size);
    };

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
            setStockCache(prev => ({
                ...prev,
                [cacheKey]: availableStock
            }));

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
        setStockCache(prev => ({
            ...prev,
            [cacheKey]: newStock
        }));
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
                } else {
                    const guestCartId = localStorage.getItem('guestCartId') || `guest_${Date.now()}`;
                    localStorage.setItem('guestCartId', guestCartId);
                    await setDoc(doc(db, 'guestCarts', guestCartId), {
                        items: cartData,
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

    // Cargar el carrito cuando cambie el usuario o al iniciar
    useEffect(() => {
        const loadCart = async () => {
            try {
                let cartDoc;
                if (user) {
                    cartDoc = await getDoc(doc(db, 'storeUsers', user.uid));
                } else {
                    const guestCartId = getGuestCartId();
                    cartDoc = await getDoc(doc(db, 'guestCarts', guestCartId));
                }

                if (cartDoc.exists()) {
                    const cartData = user ? cartDoc.data().cart : cartDoc.data().items;
                    const loadedCart = cleanCartData(cartData || []);
                    setCart(loadedCart);
                    
                    // Precargar caché de stock en paralelo
                    const stockPromises = loadedCart.map(async item => {
                        const [productId, size] = item.size.split('__');
                        const sizeKey = `${productId}__${size}`;
                        const availableStock = await getProductStock(productId, sizeKey);
                        return { productId, size, availableStock };
                    });

                    const stockResults = await Promise.all(stockPromises);
                    stockResults.forEach(({ productId, size, availableStock }) => {
                        updateStockCache(productId, size, availableStock);
                    });
                } else {
                    setCart([]);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setCart([]);
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [user]);

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