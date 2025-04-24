import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Button, Divider, Select, MenuItem, Box, IconButton, CircularProgress, TextField, Snackbar, Alert, FormControl, InputLabel } from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/priceUtils';
import { useCart } from '../../context/CartContext';

export default function ProductPage() {
    const { id } = useParams();
    const { addMultipleToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [maxQuantity, setMaxQuantity] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (selectedSize && product?.inventory) {
            const availableQuantity = product.inventory[selectedSize] || 0;
            setMaxQuantity(availableQuantity);
            // Si la cantidad actual es mayor que el nuevo máximo, ajustarla
            if (quantity > availableQuantity) {
                setQuantity(availableQuantity);
            }
        } else {
            setMaxQuantity(0);
            setQuantity(1);
        }
    }, [selectedSize, product, quantity]);

    const handleQuantityChange = (event) => {
        const newQuantity = parseInt(event.target.value);
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            setSnackbar({
                open: true,
                message: 'Por favor selecciona una talla',
                severity: 'error'
            });
            return;
        }

        if (quantity > maxQuantity) {
            setSnackbar({
                open: true,
                message: `Solo hay ${maxQuantity} unidades disponibles`,
                severity: 'error'
            });
            return;
        }

        try {
            await addMultipleToCart(product, selectedSize, quantity);
            setSnackbar({
                open: true,
                message: 'Producto agregado al carrito',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message,
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
        </Container>
    );

    if (!product) return null;

    const formattedPrice = formatPrice(product.price);
    const mainImage = product.images?.[0] || '/assets/placeholder.jpg';
    const additionalImages = product.images?.slice(1, 5) || [];
    
    // Modificar la forma en que se obtienen las tallas disponibles
    const availableSizes = product.sizes
        ?.map(size => {
            // Extraer solo la talla del formato "ID__TALLA"
            const sizeOnly = size.split('__')[1];
            // Usar la talla sin ID para buscar en el inventario
            const stock = product.inventory?.[sizeOnly] || 0;
            return {
                size: sizeOnly,
                stock: stock
            };
        })
        .filter(item => item.stock > 0)
        .map(item => item.size) || [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Galería de imágenes */}
                <Grid item xs={12} md={6} sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}>
                    <Box sx={{ 
                        width: '100%',
                        maxWidth: '600px',
                        '@media (min-width: 769px)': {
                            aspectRatio: '3/4',
                            overflow: 'hidden'
                        }
                    }}>
                        <img
                            src={mainImage}
                            alt={product.name}
                            style={{ 
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                        />
                    </Box>
                </Grid>

                {/* Información del producto */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        maxWidth: '400px',
                        '@media (min-width: 769px)': {
                            margin: '0 auto'
                        }
                    }}>
                        <Typography variant="h4" gutterBottom>
                            {product.name}
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                            {formattedPrice}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Tallas */}
                        {product.sizes && product.sizes.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Talla
                                </Typography>
                                <FormControl fullWidth>
                                    <InputLabel>Talla</InputLabel>
                                    <Select
                                        value={selectedSize}
                                        onChange={(e) => setSelectedSize(e.target.value)}
                                        label="Talla"
                                    >
                                        <MenuItem value="">
                                            <em>Selecciona una talla</em>
                                        </MenuItem>
                                        {availableSizes.map((size) => (
                                            <MenuItem key={size} value={size}>
                                                {size} ({product.inventory[size]} disponibles)
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        )}

                        {/* Cantidad */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Cantidad
                            </Typography>
                            <TextField
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                inputProps={{ 
                                    min: 1,
                                    max: maxQuantity,
                                    step: 1
                                }}
                                fullWidth
                                disabled={!selectedSize || maxQuantity === 0}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {selectedSize 
                                    ? `${maxQuantity} disponibles` 
                                    : 'Selecciona una talla'}
                            </Typography>
                        </Box>

                        {/* Botones de acción */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton aria-label="add to favorites" color="secondary" size="large">
                                <FavoriteBorder />
                            </IconButton>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddShoppingCart />}
                                fullWidth
                                onClick={handleAddToCart}
                                disabled={!selectedSize || maxQuantity === 0}
                            >
                                {maxQuantity === 0 ? 'Sin stock' : 'Añadir al carrito'}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}