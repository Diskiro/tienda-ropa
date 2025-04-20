import { useState } from 'react';
import { Container, Grid, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';

const allProducts = ["hola"]; // Todos tus productos

export default function CatalogPage() {
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('newest');

    const filteredProducts = allProducts.filter(product =>
        filter === 'all' || product.category === filter
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sort === 'price-low') return a.price - b.price;
        if (sort === 'price-high') return b.price - a.price;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const categories = [...new Set(allProducts.map(product => product.category))];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Nuestro Catálogo
            </Typography>

            {/* Filtros y ordenamiento */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        label="Categoría"
                    >
                        <MenuItem value="all">Todas</MenuItem>
                        {categories.map(category => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        label="Ordenar por"
                    >
                        <MenuItem value="newest">Novedades</MenuItem>
                        <MenuItem value="price-low">Precio: menor a mayor</MenuItem>
                        <MenuItem value="price-high">Precio: mayor a menor</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Lista de productos */}
            <Grid container spacing={3}>
                {sortedProducts.map(product => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}