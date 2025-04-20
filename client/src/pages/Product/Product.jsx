import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Button, Divider, Select, MenuItem, Box, IconButton } from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import {products} from '../../data'; // Asegúrate de tener tus productos en este archivo

 // Todos tus productos

export default function ProductPage() {
    const { id } = useParams();
    const product = products.find(p => p.id === id);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!product) return <div>Producto no encontrado</div>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Galería de imágenes */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '100%', display: 'block' }}
                        />
                    </Box>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        {product.images.slice(0, 4).map((img, index) => (
                            <Grid item xs={3} key={index}>
                                <img
                                    src={img}
                                    alt={`Vista ${index + 1}`}
                                    style={{ width: '100%', borderRadius: '4px', cursor: 'pointer' }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Información del producto */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 2, color: 'primary.main' }}>
                        ${product.price.toFixed(2)}
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography paragraph>{product.description}</Typography>

                    {/* Selector de tallas */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        Talla:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                        {product.sizes.map(size => (
                            <Button
                                key={size}
                                variant={selectedSize === size ? 'contained' : 'outlined'}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </Button>
                        ))}
                    </Box>

                    {/* Selector de cantidad */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Typography variant="h6">Cantidad:</Typography>
                        <Select
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            sx={{ minWidth: 80 }}
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <MenuItem key={num} value={num}>{num}</MenuItem>
                            ))}
                        </Select>
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddShoppingCart />}
                            disabled={!selectedSize}
                            sx={{ flexGrow: 1 }}
                        >
                            Añadir al carrito
                        </Button>
                        <IconButton size="large">
                            <FavoriteBorder />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}