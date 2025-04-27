import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import { fetchProducts, fetchCategories } from '../../data';
import styles from './HomePage.module.css';

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
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
                // Filtrar productos destacados
                const featured = productsData.filter(product => product.featured);
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

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;

    return (
        <Container maxWidth="xl" className={styles.homeContainer}>
            {/* Banner promocional */}
            <img
                src="/assets/banner.jpg"
                alt="Promoción"
                className={styles.banner}
            />

            {/* Productos destacados */}
            <Typography variant="h4" className={styles.sectionTitle}>
                Productos Destacados
            </Typography>
            <Grid container spacing={3} className={styles.featuredGrid}>
                {featuredProducts.map(product => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} className={styles.featuredItem}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {/* Categorías */}
            <Typography variant="h4" className={styles.sectionTitle}>
                Explora nuestras categorías
            </Typography>
            <Grid container spacing={3} className={styles.categoriesGrid}>
                {categories.map(category => (
                    <Grid item xs={12} sm={6} md={4} key={category.id} className={styles.categoryItem}>
                        <CategoryCard category={category} />
                    </Grid>
                ))}
            </Grid>

            {/* Sobre la marca */}
            <Grid container spacing={4} className={styles.aboutSection}>
                <Grid item xs={12} md={6}>
                    <img
                        src="/assets/about.jpg"
                        alt="Sobre nosotros"
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
                    >
                        Conoce más
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}