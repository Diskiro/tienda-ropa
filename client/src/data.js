import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export const fetchProducts = async () => {
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        return productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const fetchCategories = async () => {
    try {
        const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
        const categoriesSnapshot = await getDocs(q);
        return categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const products = [
    {
        id: '1',
        name: 'Vestido Floral',
        description: 'Vestido de verano con diseño floral',
        price: 49.99,
        category: 'Vestidos',
        sizes: ['S', 'M', 'L'],
        images: ['/assets/logo192.png'],
        featured: true
    },
    {
      id: '2',
      name: 'Blusa Elegante',
      description: 'Blusa de seda para ocasiones especiales',
      price: 39.99,
      category: 'Blusas',
      sizes: ['XS', 'S', 'M'],
      images: ['/assets/blusa-elegante.jpg'],
      stock: 15
    },
];

export const categori = [
    { id: '1', name: 'Vestidos', image: '/assets/category-dresses.jpg' },
    { id: '2', name: 'Blusas', image: '/assets/category-blouses.jpg' },
    // Agrega más categorías
];