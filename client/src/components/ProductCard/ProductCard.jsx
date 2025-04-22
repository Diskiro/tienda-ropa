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
import { formatPrice } from '../../utils/priceUtils';
import PropTypes from 'prop-types';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const mainImage = product.images?.[0] || '/assets/placeholder.jpg';
    const availableSizes = product.sizes?.filter(size => product.inventory?.[size] > 0) || [];

    const handleAddToCart = () => {
        if (!selectedSize) {
            setSnackbar({
                open: true,
                message: 'Por favor selecciona una talla',
                severity: 'error'
            });
            return;
        }

        addToCart(product, 1, selectedSize);
        setSnackbar({
            open: true,
            message: 'Producto agregado al carrito',
            severity: 'success'
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6
            }
        }}>
            <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                <CardMedia
                    component="img"
                    image={mainImage}
                    alt={product.name}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 1,
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/producto/${product.id}`)}
                />
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3.6em'
                    }}
                >
                    {product.name}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.8em',
                        mb: 1
                    }}
                >
                    {product.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    {formatPrice(product.price)}
                </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Box sx={{ width: '100%' }}>
                    {availableSizes.length > 0 && (
                        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                            <InputLabel id="size-label">Talla</InputLabel>
                            <Select
                                labelId="size-label"
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                label="Talla"
                                displayEmpty
                            >
                                {availableSizes.map((size) => (
                                    <MenuItem key={size} value={size}>
                                        {size} ({product.inventory[size]} disponibles)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton aria-label="add to favorites" color="secondary">
                            <FavoriteBorder />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<AddShoppingCart />}
                            fullWidth
                            onClick={handleAddToCart}
                            disabled={!selectedSize || availableSizes.length === 0}
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