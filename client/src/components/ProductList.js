import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from '../data';
import ProductCard from './ProductCard';
import { FavoritesProvider } from '../context/FavoritesContext';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    fetchProducts(),
                    fetchCategories()
                ]);

                // Filtrar productos que tienen al menos una talla con stock
                const productsWithStock = productsData.filter(product => {
                    if (!product.inventory) return false;
                    
                    // Sumar todo el stock del producto
                    const totalStock = Object.values(product.inventory).reduce((sum, stock) => sum + stock, 0);
                    return totalStock > 0;
                });

                setProducts(productsWithStock);
                setCategories(categoriesData);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los productos');
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (products.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No hay productos disponibles en este momento
                </Typography>
            </Box>
        );
    }

    return (
        <FavoritesProvider>
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 3,
                p: 2
            }}>
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </Box>
        </FavoritesProvider>
    );
};

export default ProductList; 