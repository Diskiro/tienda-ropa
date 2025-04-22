import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Button } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import { fetchProducts, fetchCategories } from '../../data';

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
        <Container maxWidth="xl">
            {/* Banner promocional */}
            <img
                src="/assets/banner.jpg"
                alt="Promoción"
                style={{ width: '100%', borderRadius: '8px', margin: '20px 0' }}
            />

            {/* Productos destacados */}
            <Typography variant="h4" gutterBottom sx={{ mt: 4, fontWeight: 'bold' }}>
                Productos Destacados
            </Typography>
            <Grid container spacing={3}>
                {featuredProducts.map(product => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>

            {/* Categorías */}
            <Typography variant="h4" gutterBottom sx={{ mt: 8, fontWeight: 'bold' }}>
                Explora nuestras categorías
            </Typography>
            <Grid container spacing={3}>
                {categories.map(category => (
                    <Grid item xs={12} sm={6} md={4} key={category.id}>
                        <CategoryCard category={category} />
                    </Grid>
                ))}
            </Grid>

            {/* Sobre la marca */}
            <Grid container spacing={4} sx={{ my: 8 }} alignItems="center">
                <Grid item xs={12} md={6}>
                    <img
                        src="/assets/about.jpg"
                        alt="Sobre nosotros"
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Nuestra Marca
                    </Typography>
                    <Typography paragraph>
                        Charys Clothes Store nació con la pasión por ofrecer moda accesible y de calidad...
                    </Typography>
                    <Button variant="contained" color="primary">
                        Conoce más
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}