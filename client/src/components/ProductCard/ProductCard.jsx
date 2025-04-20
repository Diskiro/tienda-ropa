import { Card, CardMedia, CardContent, Typography, Button, IconButton } from '@mui/material';
import { FavoriteBorder, AddShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Box } from '@mui/system';
import placeholderImage from '../../assets/logo192.png'; // Añade una imagen por defecto


export default function ProductCard({ product }) {
    // Verificación y valores por defecto
    const productImages = product?.images || [placeholderImage];
    const mainImage = productImages[0] || placeholderImage;
    const productName = product?.name || 'Producto sin nombre';
    const productPrice = product?.price ? `$${product.price.toFixed(2)}` : '$0.00';
    const productCategory = product?.category || 'Sin categoría';

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Link to={`/producto/${product?.id || ''}`}>
                <CardMedia
                    component="img"
                    image={mainImage}
                    alt={productName}
                    sx={{
                        height: 200,
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5' // Fondo por si la imagen no carga
                    }}
                />
            </Link>

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3">
                    {productName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {productCategory}
                </Typography>
                <Typography variant="h6" color="primary">
                    {productPrice}
                </Typography>
            </CardContent>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <IconButton aria-label="add to favorites">
                    <FavoriteBorder />
                </IconButton>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddShoppingCart />}
                    sx={{ ml: 'auto' }}
                >
                    Añadir
                </Button>
            </Box>
        </Card>
    );
}