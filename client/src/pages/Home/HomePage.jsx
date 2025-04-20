import { Container, Grid, Typography, Button } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import {products} from '../../data'; // Asegúrate de que la ruta sea correcta

const featuredProducts = [products]; // Tus productos destacados 
const categories = ["Vestido","rpa"]; // Tus categorías

export default function HomePage() {
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