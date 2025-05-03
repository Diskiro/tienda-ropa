import { useState, useEffect, useRef } from 'react';
import { Container, Grid, Typography, Button, Box, CircularProgress } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import { fetchProducts, fetchCategories } from '../../data';
import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import { FavoritesProvider } from '../../context/FavoritesContext';

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const carouselRef = useRef(null);

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

                // Filtrar productos destacados de los que tienen stock
                const featured = productsWithStock.filter(product => product.featured);
                setFeaturedProducts(featured);
                setCategories(categoriesData);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos');
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
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <FavoritesProvider>
            <Container maxWidth="xl" className={styles.homeContainer}>
                {/* Banner promocional personalizado */}
                <div className={styles.promoSection}>
                    <Typography variant="h2" className={styles.promoTitle}>
                        Chary's Boutique
                    </Typography>
                    <Typography variant="h5" className={styles.promoSubtitle}>
                        Tu destino para moda y belleza: ropa curvy exclusiva y todo para tu belleza
                    </Typography>
                    <div className={styles.promoButtons}>
                        <Button variant="contained" color="secondary" className={styles.promoBtnMain} href="/categorias">
                            Ver Colección de Ropa
                        </Button>
                        <Button variant="outlined" color="secondary" className={styles.promoBtnAlt}>
                            Accesorios de Uñas
                        </Button>
                    </div>
                </div>

                {/* Productos destacados */}
                <Typography variant="h4" className={styles.sectionTitle}>
                    Productos Destacados
                </Typography>
                {featuredProducts.length > 4 ? (
                    <div className={styles.carouselContainer}>
                        <div className={styles.carousel} ref={carouselRef}>
                            {featuredProducts.slice(0, 15).map(product => (
                                <div className={styles.carouselItem} key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <Button variant="outlined" color="secondary" className={styles.showAllFeaturedBtn}>
                                Ver más destacados
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Grid container spacing={3} className={styles.featuredGrid}>
                        {featuredProducts.map(product => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} className={styles.featuredItem}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Categorías */}
                <Typography variant="h4" className={styles.sectionTitle}>
                    Explora nuestras categorías
                </Typography>
                <Grid container spacing={3} className={styles.categoriesGrid}>
                    {categories.slice(0, 6).map(category => (
                        <Grid item xs={12} sm={6} md={4} key={category.id} className={styles.categoryItem}>
                            <CategoryCard category={category} />
                        </Grid>
                    ))}
                </Grid>
                {categories.length > 6 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            href="/categorias"
                            className={styles.showAllCategoriesBtn}
                        >
                            Ver todas las categorías
                        </Button>
                    </div>
                )}

                {/* Sobre la marca */}
                <Grid container spacing={4} className={styles.aboutSection}>
                    <Grid item xs={12} md={6} className={styles.aboutGridImage}>
                        <img
                            src="/CharysBoutique.jpeg"
                            alt="Chary's Boutique"
                            className={styles.aboutImage}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} className={styles.aboutContent}>
                        <Typography variant="h4" className={styles.aboutTitle}>
                            Nuestra Marca
                        </Typography>
                        <Typography paragraph className={styles.aboutText}>
                            Charys Clothes Store nació con la pasión por ofrecer moda accesible y de calidad...
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary"
                            className={styles.aboutButton}
                            component={Link}
                            to="/about"
                        >
                            Conoce más
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </FavoritesProvider>
    );
}