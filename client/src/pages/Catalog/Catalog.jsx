import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress, Button } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import { db } from '../../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { normalizeCategoryName } from '../../utils/categoryUtils';
import { formatPrice } from '../../utils/priceUtils';

export default function CatalogPage() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const categoryFromUrl = searchParams.get('category');
                
                if (!categoryFromUrl) {
                    // Si no hay categoría, cargar todas las categorías
                    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
                    const categoriesList = categoriesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setCategories(categoriesList);
                    setProducts([]);
                    return;
                }

                // Si hay categoría, cargar productos de esa categoría
                const normalizedCategory = normalizeCategoryName(categoryFromUrl);
                const productsQuery = query(
                    collection(db, 'products'),
                    where('category', '==', normalizedCategory),
                    limit(showAll ? 100 : 5)
                );

                const querySnapshot = await getDocs(productsQuery);
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    formattedPrice: formatPrice(doc.data().price)
                }));
                
                console.log('Productos encontrados:', productsList); // Para debugging
                setProducts(productsList);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, showAll]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Si no hay categoría seleccionada, mostrar todas las categorías
    if (!searchParams.get('category')) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Categorías
                </Typography>
                <Grid container spacing={3}>
                    {categories.map(category => (
                        <Grid item xs={12} sm={6} md={4} key={category.id}>
                            <CategoryCard category={category} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    // Si hay categoría seleccionada, mostrar productos
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {normalizeCategoryName(searchParams.get('category'))}
            </Typography>

            <Grid container spacing={3}>
                {products.length > 0 ? (
                    products.map(product => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary">
                            No hay productos disponibles en esta categoría
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {!showAll && products.length >= 5 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowAll(true)}
                    >
                        Ver más productos
                    </Button>
                </Box>
            )}
        </Container>
    );
}