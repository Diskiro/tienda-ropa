import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress, Button, Pagination } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { normalizeCategoryName } from '../../utils/categoryUtils';
import { formatPrice } from '../../utils/priceUtils';
import styles from './Catalog.module.css';
import { FavoritesProvider } from '../../context/FavoritesContext';

export default function CatalogPage() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const categoryFromUrl = searchParams.get('category');
                
                if (!categoryFromUrl) {
                    // Si no hay categoría, cargar todas las categorías
                    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
                    const categoriesSnapshot = await getDocs(q);
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
                    where('category', '==', normalizedCategory)
                );

                const querySnapshot = await getDocs(productsQuery);
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    formattedPrice: formatPrice(doc.data().price)
                }));

                // Filtrar productos que tienen al menos una talla con stock
                const productsWithStock = productsList.filter(product => {
                    if (!product.inventory) return false;
                    
                    // Sumar todo el stock del producto
                    const totalStock = Object.values(product.inventory).reduce((sum, stock) => sum + stock, 0);
                    return totalStock > 0;
                });

                setProducts(productsWithStock);
                setPage(1); // Resetear la página cuando cambia la categoría
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // Calcular los productos para la página actual
    const indexOfLastProduct = page * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            <FavoritesProvider>
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
            </FavoritesProvider>
        );
    }

    // Si hay categoría seleccionada, mostrar productos
    return (
        <FavoritesProvider>
            <Container maxWidth="xl" className={styles.catalogContainer}>
                <Typography variant="h3" className={styles.catalogTitle}>
                    {normalizeCategoryName(searchParams.get('category'))}
                </Typography>

                <Grid container spacing={3} className={styles.productsGrid}>
                    {currentProducts.length > 0 ? (
                        currentProducts.map(product => (
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

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton 
                            showLastButton
                        />
                    </Box>
                )}
            </Container>
        </FavoritesProvider>
    );
}