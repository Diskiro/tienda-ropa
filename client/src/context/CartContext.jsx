import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

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
            // Intentar obtener productId de item.productId o del formato de size
            let productId = item.productId;
            if (!productId && item.size && item.size.includes('__')) {
                productId = item.size.split('__')[0];
            }

            return {
                id: item.id || '', // Mantener id si existe por compatibilidad?
                productId: productId || '', // Asegurar que productId exista
                name: item.name || 'Nombre no disponible',
                price: item.price || 0,
                image: item.image || '',
                size: item.size || '',
                quantity: item.quantity || 1,
                createdAt: item.createdAt || new Date().toISOString() // Añadir fecha si no existe
            };
        }).filter(item => item.productId && item.size); // Filtrar items inválidos sin productId o size
    };

    // Cargar el carrito cuando cambie el usuario o al iniciar
    useEffect(() => {
        const loadCart = async () => {
            try {
                if (user) {
                    // Cargar carrito de usuario autenticado
                    const userDoc = await getDoc(doc(db, 'storeUsers', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setCart(cleanCartData(userData.cart || []));
                    } else {
                        setCart([]);
                    }
                } else {
                    // Cargar carrito de invitado
                    const guestCartId = getGuestCartId();
                    const cartDoc = await getDoc(doc(db, 'guestCarts', guestCartId));
                    if (cartDoc.exists()) {
                        setCart(cleanCartData(cartDoc.data().items || []));
                    } else {
                        setCart([]);
                    }
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

    // Función para guardar el carrito en Firestore
    const saveCart = async (cartData) => {
        try {
            if (user) {
                // Guardar en el documento del usuario
                await setDoc(doc(db, 'storeUsers', user.uid), {
                    cart: cartData,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } else {
                // Guardar en el carrito de invitado
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
    };

    const addSingleToCart = async (product, size) => {
        try {
            // Verificar stock disponible en tiempo real
            const productDoc = await getDoc(doc(db, 'products', product.id));
            if (!productDoc.exists()) {
                throw new Error('Producto no encontrado');
            }

            const productData = productDoc.data();
            // Extraer solo la talla del formato ID__TALLA si es necesario
            const sizeOnly = size.includes('__') ? size.split('__')[1] : size;
            const availableStock = productData.inventory?.[sizeOnly] || 0;

            if (availableStock <= 0) {
                throw new Error('No hay stock disponible para esta talla');
            }

            const newCart = [...cart];
            // Usar el formato completo de la talla (ID__TALLA)
            const fullSize = `${product.id}__${sizeOnly}`;
            const existingItemIndex = newCart.findIndex(
                item => item.size === fullSize
            );

            // Verificar si al agregar uno más excedería el stock disponible
            if (existingItemIndex >= 0) {
                const currentQuantity = newCart[existingItemIndex].quantity;
                if (currentQuantity + 1 > availableStock) {
                    throw new Error('No hay suficiente stock disponible');
                }
                newCart[existingItemIndex].quantity += 1;
            } else {
                newCart.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    size: fullSize,
                    quantity: 1,
                    image: product.images?.[0] || '',
                    createdAt: new Date().toISOString()
                });
            }

            setCart(newCart);
            await saveCart(newCart);
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const addMultipleToCart = async (product, size, quantity) => {
        try {
            // Verificar stock disponible en tiempo real
            const productDoc = await getDoc(doc(db, 'products', product.id));
            if (!productDoc.exists()) {
                throw new Error('Producto no encontrado');
            }

            const productData = productDoc.data();
            // Extraer solo la talla del formato ID__TALLA si es necesario
            const sizeOnly = size.includes('__') ? size.split('__')[1] : size;
            const availableStock = productData.inventory?.[sizeOnly] || 0;

            if (availableStock <= 0) {
                throw new Error('No hay stock disponible para esta talla');
            }

            const newCart = [...cart];
            // Usar el formato completo de la talla (ID__TALLA)
            const fullSize = `${product.id}__${sizeOnly}`;
            const existingItemIndex = newCart.findIndex(
                item => item.size === fullSize
            );

            // Verificar si al agregar la cantidad excedería el stock disponible
            if (existingItemIndex >= 0) {
                const currentQuantity = newCart[existingItemIndex].quantity;
                if (currentQuantity + quantity > availableStock) {
                    throw new Error(`Solo hay ${availableStock} unidades disponibles`);
                }
                newCart[existingItemIndex].quantity += quantity;
            } else {
                if (quantity > availableStock) {
                    throw new Error(`Solo hay ${availableStock} unidades disponibles`);
                }
                newCart.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    size: fullSize,
                    quantity: quantity,
                    image: product.images?.[0] || '',
                    createdAt: new Date().toISOString()
                });
            }

            setCart(newCart);
            await saveCart(newCart);
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    // Mantener addToCart para compatibilidad hacia atrás
    const addToCart = async (product, size, quantity = 1) => {
        if (quantity === 1) {
            return addSingleToCart(product, size);
        } else {
            return addMultipleToCart(product, size, quantity);
        }
    };

    const removeFromCart = async (productId, size) => {
        try {
            // Usar el formato completo de la talla (ID__TALLA) para buscar el elemento
            const fullSize = `${productId}__${size}`;
            const newCart = cart.filter(item => item.size !== fullSize);
            setCart(newCart);
            await saveCart(newCart);
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (productId, size, quantity) => {
        try {
            if (quantity <= 0) {
                removeFromCart(productId, size);
                return;
            }

            // Obtener el stock actual del producto
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (!productDoc.exists()) {
                throw new Error('Producto no encontrado');
            }

            const productData = productDoc.data();
            // Usar la talla sin ID para buscar en el inventario
            const sizeOnly = size.split('__')[1];
            const availableStock = productData.inventory?.[sizeOnly] || 0;

            if (quantity > availableStock) {
                throw new Error('No hay suficiente stock disponible');
            }

            // Usar el formato completo de la talla para actualizar el carrito
            const fullSize = `${productId}__${sizeOnly}`;
            setCart(prevCart =>
                prevCart.map(item =>
                    item.size === fullSize
                        ? { ...item, quantity }
                        : item
                )
            );
            await saveCart(cart);
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            setCart([]);
            // Guardar el carrito vacío en Firestore
            await saveCart([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
            // Opcional: manejar el error, mostrar notificación, etc.
        }
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Migrar carrito de invitado a usuario cuando se autentica
    const migrateGuestCartToUser = async (userId) => {
        try {
            const guestCartId = getGuestCartId();
            const guestCartDoc = await getDoc(doc(db, 'guestCarts', guestCartId));
            
            if (guestCartDoc.exists()) {
                const guestCart = cleanCartData(guestCartDoc.data().items || []);
                const userDoc = await getDoc(doc(db, 'storeUsers', userId));
                const userData = userDoc.exists() ? userDoc.data() : {};
                const userCart = cleanCartData(userData.cart || []);

                // Combinar carritos
                const mergedCart = [...userCart];
                guestCart.forEach(guestItem => {
                    const existingItem = mergedCart.find(
                        item => item.cartItemId === guestItem.cartItemId
                    );
                    if (existingItem) {
                        existingItem.quantity += guestItem.quantity;
                    } else {
                        mergedCart.push(guestItem);
                    }
                });

                // Guardar carrito combinado en el documento del usuario manteniendo los datos existentes
                await setDoc(doc(db, 'storeUsers', userId), {
                    ...userData,
                    cart: cleanCartData(mergedCart),
                    updatedAt: new Date().toISOString()
                });

                // Limpiar carrito de invitado
                await setDoc(doc(db, 'guestCarts', guestCartId), {
                    items: [],
                    updatedAt: new Date().toISOString()
                });
                localStorage.removeItem('guestCartId');
            }
        } catch (error) {
            console.error('Error migrating cart:', error);
        }
    };

    const value = {
        cart,
        loading,
        addToCart,
        addSingleToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        migrateGuestCartToUser
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
} 