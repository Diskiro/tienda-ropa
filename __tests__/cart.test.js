import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock de productos
const mockProducts = {
  product1: {
    id: '1',
    name: 'Camiseta Básica',
    price: 29.99,
    size: 'M',
    color: 'Negro',
    inventory: {
      '1__M': 10
    }
  },
  product2: {
    id: '2',
    name: 'Pantalón Vaquero',
    price: 49.99,
    size: 'L',
    color: 'Azul',
    inventory: {
      '2__L': 5
    }
  }
};

describe('Carrito de Compras', () => {
  let cart = [];
  
  beforeEach(() => {
    cart = [];
  });

  test('debe poder agregar un producto al carrito', () => {
    const addToCart = (product, size, quantity = 1) => {
      const sizeKey = `${product.id}__${size}`;
      cart.push({
        ...product,
        size: sizeKey,
        quantity
      });
    };

    addToCart(mockProducts.product1, 'M', 1);
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].size).toBe('1__M');
  });

  test('debe actualizar la cantidad de un producto existente', () => {
    const addToCart = (product, size, quantity = 1) => {
      const sizeKey = `${product.id}__${size}`;
      const existingItemIndex = cart.findIndex(item => item.size === sizeKey);
      
      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({
          ...product,
          size: sizeKey,
          quantity
        });
      }
    };

    addToCart(mockProducts.product1, 'M', 1);
    addToCart(mockProducts.product1, 'M', 2);
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(3);
  });

  test('debe calcular el total correctamente', () => {
    const calculateTotal = (items) => {
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    cart = [
      { ...mockProducts.product1, quantity: 2 },
      { ...mockProducts.product2, quantity: 1 }
    ];

    const total = calculateTotal(cart);
    expect(total).toBe(109.97); // (29.99 * 2) + 49.99
  });

  test('debe poder remover productos del carrito', () => {
    const removeFromCart = (productId, size) => {
      const sizeKey = `${productId}__${size}`;
      cart = cart.filter(item => item.size !== sizeKey);
    };

    // Agregar productos al carrito
    cart = [
      { ...mockProducts.product1, size: '1__M', quantity: 1 },
      { ...mockProducts.product2, size: '2__L', quantity: 1 }
    ];

    removeFromCart('1', 'M');
    expect(cart.length).toBe(1);
    expect(cart[0].id).toBe('2');
  });

  test('debe validar el stock disponible', () => {
    const validateStock = (product, size, quantity) => {
      const sizeKey = `${product.id}__${size}`;
      const availableStock = product.inventory[sizeKey] || 0;
      return quantity <= availableStock;
    };

    expect(validateStock(mockProducts.product1, 'M', 5)).toBe(true);
    expect(validateStock(mockProducts.product1, 'M', 15)).toBe(false);
  });
}); 