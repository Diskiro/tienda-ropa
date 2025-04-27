import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    IconButton,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/priceUtils';
import PropTypes from 'prop-types';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [selectedSize, setSelectedSize] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const mainImage = product.images?.[0] || '/assets/placeholder.jpg';
    
    // Obtener las tallas disponibles del inventario
    const availableSizes = Object.entries(product.inventory || {})
        .filter(([_, stock]) => stock > 0)
        .map(([sizeKey]) => sizeKey.split('__')[1])
        .sort((a, b) => {
            // Ordenar las tallas de manera lógica
            const sizeOrder = { 'L': 1, 'XL': 2, '1XL': 3, '2XL': 4, '3XL': 5, '4XL': 6, '5XL': 7 };
            return sizeOrder[a] - sizeOrder[b];
        });

    const handleAddToCart = async () => {
        if (!selectedSize) {
            setSnackbar({
                open: true,
                message: 'Por favor selecciona una talla',
                severity: 'error'
            });
            return;
        }

        try {
            await addToCart(product, selectedSize);
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

    return (
        <Card className={styles.productCard}>
            <Box className={styles.imageContainer}>
                <CardMedia
                    component="img"
                    image={mainImage}
                    alt={product.name}
                    className={styles.productImage}
                    onClick={() => navigate(`/producto/${product.id}`)}
                />
            </Box>
            <CardContent className={styles.content}>
                <Typography 
                    className={styles.title}
                >
                    {product.name}
                </Typography>
                <Typography 
                    className={styles.description}
                >
                    {product.description}
                </Typography>
                <Typography className={styles.price}>
                    {formatPrice(product.price)}
                </Typography>
            </CardContent>
            <CardActions className={styles.actions}>
                <Box sx={{ width: '100%' }}>
                    {availableSizes && availableSizes.length > 0 && (
                        <FormControl fullWidth size="small" className={styles.sizeSelect}>
                            <InputLabel id="size-label">Talla</InputLabel>
                            <Select
                                labelId="size-label"
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                label="Talla"
                            >
                                <MenuItem value="">
                                    <em>Selecciona una talla</em>
                                </MenuItem>
                                {availableSizes.map((size) => (
                                    <MenuItem key={size} value={size}>
                                        {size} ({product.inventory[`${product.id}__${size}`]} disponibles)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <Box className={styles.buttonContainer}>
                        <IconButton 
                            aria-label="add to favorites" 
                            color="secondary"
                            className={styles.favoriteButton}
                        >
                            <FavoriteBorder />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<AddShoppingCart />}
                            fullWidth
                            onClick={handleAddToCart}
                            disabled={!selectedSize || availableSizes.length === 0}
                            className={styles.addToCartButton}
                        >
                            {availableSizes.length === 0 ? 'Sin stock' : 'Añadir al carrito'}
                        </Button>
                    </Box>
                </Box>
            </CardActions>
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
        </Card>
    );
}

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        images: PropTypes.arrayOf(PropTypes.string),
        name: PropTypes.string,
        price: PropTypes.number,
        category: PropTypes.string,
        sizes: PropTypes.arrayOf(PropTypes.string),
        inventory: PropTypes.object
    })
};

ProductCard.defaultProps = {
    product: {
        id: '',
        images: [],
        name: 'Producto sin nombre',
        price: 0,
        category: 'Sin categoría',
        sizes: [],
        inventory: {}
    }
};