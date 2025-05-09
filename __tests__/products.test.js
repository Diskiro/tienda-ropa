import '@testing-library/jest-dom';

describe('Manejo de Productos', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Camiseta Básica',
      price: 29.99,
      category: 'ropa',
      sizes: ['S', 'M', 'L'],
      colors: ['Negro', 'Blanco'],
      inventory: {
        '1__S': 5,
        '1__M': 10,
        '1__L': 8
      }
    },
    {
      id: '2',
      name: 'Pantalón Vaquero',
      price: 49.99,
      category: 'ropa',
      sizes: ['M', 'L', 'XL'],
      colors: ['Azul', 'Negro'],
      inventory: {
        '2__M': 3,
        '2__L': 5,
        '2__XL': 2
      }
    }
  ];

  test('debe filtrar productos por categoría', () => {
    const filterByCategory = (products, category) => {
      return products.filter(product => product.category === category);
    };

    const ropaProducts = filterByCategory(mockProducts, 'ropa');
    expect(ropaProducts.length).toBe(2);
    
    const accesoriosProducts = filterByCategory(mockProducts, 'accesorios');
    expect(accesoriosProducts.length).toBe(0);
  });

  test('debe filtrar productos por rango de precio', () => {
    const filterByPriceRange = (products, min, max) => {
      return products.filter(product => product.price >= min && product.price <= max);
    };

    const affordableProducts = filterByPriceRange(mockProducts, 0, 30);
    expect(affordableProducts.length).toBe(1);
    expect(affordableProducts[0].name).toBe('Camiseta Básica');

    const expensiveProducts = filterByPriceRange(mockProducts, 40, 60);
    expect(expensiveProducts.length).toBe(1);
    expect(expensiveProducts[0].name).toBe('Pantalón Vaquero');
  });

  test('debe verificar disponibilidad de tallas', () => {
    const checkSizeAvailability = (product, size) => {
      const sizeKey = `${product.id}__${size}`;
      return product.inventory[sizeKey] > 0;
    };

    expect(checkSizeAvailability(mockProducts[0], 'M')).toBe(true);
    expect(checkSizeAvailability(mockProducts[0], 'XXL')).toBe(false);
  });

  test('debe calcular el stock total de un producto', () => {
    const calculateTotalStock = (product) => {
      return Object.values(product.inventory).reduce((total, stock) => total + stock, 0);
    };

    const totalStock = calculateTotalStock(mockProducts[0]);
    expect(totalStock).toBe(23); // 5 + 10 + 8
  });

  test('debe validar datos del producto', () => {
    const validateProduct = (product) => {
      if (!product) return false;
      return typeof product.id === 'string' &&
             typeof product.name === 'string' &&
             typeof product.price === 'number' &&
             Array.isArray(product.sizes) &&
             Array.isArray(product.colors) &&
             typeof product.inventory === 'object';
    };

    expect(validateProduct(mockProducts[0])).toBe(true);
    expect(validateProduct({})).toBe(false);
    expect(validateProduct(null)).toBe(false);
  });
}); 