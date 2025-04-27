import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress, Button } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import { db } from '../../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { normalizeCategoryName } from '../../utils/categoryUtils';
import { formatPrice } from '../../utils/priceUtils';
import styles from './Catalog.module.css';

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
            <Box className={styles.loadingContainer}>
                <CircularProgress />
            </Box>
        );
    }

    // Si no hay categoría seleccionada, mostrar todas las categorías
    if (!searchParams.get('category')) {
        return (
            <Container maxWidth="xl" className={styles.catalogContainer}>
                <Typography variant="h3" className={styles.catalogTitle}>
                    Categorías
                </Typography>
                <Grid container spacing={3} className={styles.categoriesGrid}>
                    {categories.map(category => (
                        <Grid item xs={12} sm={6} md={4} key={category.id} className={styles.categoryItem}>
                            <CategoryCard category={category} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    // Si hay categoría seleccionada, mostrar productos
    return (
        <Container maxWidth="xl" className={styles.catalogContainer}>
            <Typography variant="h3" className={styles.catalogTitle}>
                {normalizeCategoryName(searchParams.get('category'))}
            </Typography>

            <Grid container spacing={3} className={styles.productsGrid}>
                {products.length > 0 ? (
                    products.map(product => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} className={styles.productItem}>
                            <ProductCard product={product} />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1" className={styles.noProductsMessage}>
                            No hay productos disponibles en esta categoría
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {!showAll && products.length >= 5 && (
                <Box className={styles.loadMoreContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowAll(true)}
                        className={styles.loadMoreButton}
                    >
                        Ver más productos
                    </Button>
                </Box>
            )}
        </Container>
    );
}