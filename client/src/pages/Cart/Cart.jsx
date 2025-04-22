import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/priceUtils';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box textAlign="center">
                    <Typography variant="h5" gutterBottom>
                        Tu carrito está vacío
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/catalogo')}
                    >
                        Ver productos
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Carrito de Compras
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell>Talla</TableCell>
                            <TableCell align="right">Precio</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cart.map((item) => (
                            <TableRow key={`${item.id}-${item.size}`}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{ width: 50, height: 50, marginRight: 10 }}
                                        />
                                        <Typography>{item.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{item.size}</TableCell>
                                <TableCell align="right">{formatPrice(item.price)}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                    >
                                        -
                                    </Button>
                                    {item.quantity}
                                    <Button
                                        size="small"
                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                    >
                                        +
                                    </Button>
                                </TableCell>
                                <TableCell align="right">
                                    {formatPrice(item.price * item.quantity)}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        onClick={() => removeFromCart(item.id, item.size)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Grid container spacing={2} justifyContent="flex-end">
                    <Grid item>
                        <Typography variant="h6">
                            Total: {formatPrice(getTotalPrice())}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleCheckout}
                        >
                            Proceder al Pago
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Cart;