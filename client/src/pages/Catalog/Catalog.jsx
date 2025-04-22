import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import ProductCard from '../../components/ProductCard/ProductCard';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { normalizeCategoryName } from '../../utils/categoryUtils';
import { formatPrice } from '../../utils/priceUtils';

export default function CatalogPage() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const categoryFromUrl = searchParams.get('category');
                
                if (!categoryFromUrl) {
                    console.error('No se proporcionó una categoría');
                    setProducts([]);
                    return;
                }

                // Construir la consulta base
                let productsQuery = collection(db, 'products');
                
                // Filtrar por categoría
                const normalizedCategory = normalizeCategoryName(categoryFromUrl);
                productsQuery = query(productsQuery, where('category', '==', normalizedCategory));

                const querySnapshot = await getDocs(productsQuery);
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    formattedPrice: formatPrice(doc.data().price)
                }));
                
                console.log('Productos encontrados:', productsList); // Para debugging
                setProducts(productsList);
            } catch (error) {
                console.error('Error al obtener los productos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {searchParams.get('category') 
                    ? `${normalizeCategoryName(searchParams.get('category'))}`
                    : 'Catálogo'}
            </Typography>

            {/* Lista de productos */}
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
        </Container>
    );
}