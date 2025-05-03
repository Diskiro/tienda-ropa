import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Link } from '@mui/material';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FavoritesProvider } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard/ProductCard';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener categorías
                const categoriesSnapshot = await getDocs(collection(db, 'categories'));
                const categoriesList = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoriesList);

                // Obtener productos
                const productsSnapshot = await getDocs(collection(db, 'products'));
                const productsList = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Agrupar productos por categoría
                const groupedProducts = {};
                productsList.forEach(product => {
                    if (!groupedProducts[product.category]) {
                        groupedProducts[product.category] = [];
                    }
                    groupedProducts[product.category].push(product);
                });

                setProductsByCategory(groupedProducts);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    return (
        <FavoritesProvider>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Todas las Categorías
                </Typography>
                {categories.map((category) => (
                    <Box key={category.id} sx={{ mb: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {category.normalizedName}
                        </Typography>
                        <Grid container spacing={3}>
                            {productsByCategory[category.id]?.length > 0 ? (
                                productsByCategory[category.id].map((product) => (
                                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
                                        <ProductCard product={product} />
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Typography variant="body1" color="text.secondary">
                                        No hay productos en esta categoría
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                ))}
            </Box>
        </FavoritesProvider>
    );
} 