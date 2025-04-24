import React, { useState, useEffect } from 'react';
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
    Grid,
    Snackbar,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/priceUtils';
import ErrorNotification from '../../components/ErrorNotification/ErrorNotification';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    const handleQuantityChange = async (productId, size, newQuantity) => {
        try {
            await updateQuantity(productId, size, newQuantity);
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

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Función para obtener solo la talla del formato ID__TALLA
    const getSizeOnly = (size) => {
        return size.split('__')[1];
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Carrito de Compras
            </Typography>
            {cart.length === 0 ? (
                <Typography variant="body1">
                    Tu carrito está vacío
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Producto</TableCell>
                                <TableCell>Talla</TableCell>
                                <TableCell align="right">Precio</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cart.map((item) => (
                                <TableRow key={`${item.productId}_${item.size}`}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 16 }}
                                            />
                                            {item.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getSizeOnly(item.size)}</TableCell>
                                    <TableCell align="right">{formatPrice(item.price)}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                // Extraer el ID del producto y la talla del formato completo
                                                const [productId] = item.size.split('__');
                                                handleQuantityChange(productId, item.size, item.quantity - 1);
                                            }}
                                        >
                                            -
                                        </Button>
                                        {item.quantity}
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                // Extraer el ID del producto y la talla del formato completo
                                                const [productId] = item.size.split('__');
                                                handleQuantityChange(productId, item.size, item.quantity + 1);
                                            }}
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
                                            onClick={() => {
                                                // Extraer el ID del producto y la talla del formato completo
                                                const [productId, size] = item.size.split('__');
                                                removeFromCart(productId, size);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {cart.length > 0 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Total: {formatPrice(getTotalPrice())}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/checkout')}
                    >
                        Proceder al Pago
                    </Button>
                </Box>
            )}

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
};

export default Cart;