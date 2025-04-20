import { Card, CardMedia, CardContent, Typography, Button, IconButton, Box } from '@mui/material';
import { FavoriteBorder, AddShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'; // Importa PropTypes para validación
import placeholderImage from '../../assets/logo192.png';

export default function ProductCard({ product = {} }) {
    // Destructuración con valores por defecto
    const {
        id = '',
        images = [placeholderImage],
        name = 'Producto sin nombre',
        price = 0,
        category = 'Sin categoría'
    } = product;

    // Formatear precio
    const formattedPrice = price.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 3
            }
        }}>
            <Link to={`/producto/${id}`} style={{ textDecoration: 'none' }}>
                <CardMedia
                    component="img"
                    image={images[0] || placeholderImage}
                    alt={name}
                    sx={{
                        height: 200,
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5'
                    }}
                />
            </Link>

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3" noWrap>
                    {name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        textTransform: 'capitalize'
                    }}
                >
                    {category}
                </Typography>
                <Typography variant="h6" color="primary">
                    {formattedPrice}
                </Typography>
            </CardContent>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <IconButton aria-label="add to favorites" color="secondary">
                    <FavoriteBorder />
                </IconButton>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddShoppingCart />}
                    sx={{ ml: 'auto' }}
                    disabled={!id} // Deshabilitar si no hay ID
                >
                    Añadir
                </Button>
            </Box>
        </Card>
    );
}

// Validación de props con PropTypes
ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        images: PropTypes.arrayOf(PropTypes.string),
        name: PropTypes.string,
        price: PropTypes.number,
        category: PropTypes.string
    })
};

// Valores por defecto para las props
ProductCard.defaultProps = {
    product: {
        id: '',
        images: [],
        name: 'Producto sin nombre',
        price: 0,
        category: 'Sin categoría'
    }
};