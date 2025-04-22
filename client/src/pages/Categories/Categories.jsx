import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { normalizeCategoryName, denormalizeCategoryName } from '../../utils/categoryUtils';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // Obtener todas las categorías
                const categoriesSnapshot = await getDocs(collection(db, 'categories'));
                const categoriesList = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    normalizedName: normalizeCategoryName(doc.data().name)
                }));
                console.log('Categorías obtenidas:', categoriesList);
                setCategories(categoriesList);
                
                // Obtener productos para cada categoría
                const productsMap = {};
                for (const category of categoriesList) {
                    console.log('Buscando productos para categoría:', category.normalizedName);
                    // Primero intentamos con el nombre normalizado
                    let productsQuery = query(
                        collection(db, 'products'),
                        where('category', '==', category.normalizedName),
                        limit(5)
                    );
                    let productsSnapshot = await getDocs(productsQuery);
                    
                    // Si no encontramos productos, intentamos con el nombre original
                    if (productsSnapshot.empty) {
                        productsQuery = query(
                            collection(db, 'products'),
                            where('category', '==', category.name),
                            limit(5)
                        );
                        productsSnapshot = await getDocs(productsQuery);
                    }

                    const products = productsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    console.log(`Productos encontrados para ${category.normalizedName}:`, products);
                    productsMap[category.id] = products;
                }
                console.log('Mapa de productos por categoría:', productsMap);
                setProductsByCategory(productsMap);
            } catch (error) {
                console.error('Error fetching categories and products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
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
                                    <Card 
                                        component={Link}
                                        to={`/producto/${product.id}`}
                                        sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={Array.isArray(product.images) && product.images.length > 0 
                                                ? product.images[0] 
                                                : '/assets/placeholder.jpg'}
                                            alt={product.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h6" component="h3" noWrap>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Intl.NumberFormat('es-ES', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(product.price)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
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
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button
                            component={Link}
                            to={`/catalogo?category=${denormalizeCategoryName(category.name)}`}
                            variant="outlined"
                            color="primary"
                        >
                            Ver más productos de {category.normalizedName}
                        </Button>
                    </Box>
                </Box>
            ))}
        </Box>
    );
} 