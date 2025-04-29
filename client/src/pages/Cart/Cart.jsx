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
    Snackbar,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/priceUtils';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCartInDatabase, loadCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const handleClearCartInDatabase = async () => {
        try {
            await clearCartInDatabase();
            // Recargar el carrito después de eliminarlo
            await loadCart();
            setSnackbar({
                open: true,
                message: 'Carrito eliminado correctamente',
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
                isMobile ? (
                    <Box>
                        {cart.map((item) => (
                            <Paper key={`${item.productId}_${item.size}`} sx={{ mb: 2, p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 16, borderRadius: 8 }}
                                    />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
                                        <Typography variant="body2">Talla: {getSizeOnly(item.size)}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                    <Typography variant="body2">Precio: {formatPrice(item.price)}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Button size="small" onClick={() => handleQuantityChange(item.productId, getSizeOnly(item.size), item.quantity - 1)}>-</Button>
                                        {item.quantity}
                                        <Button size="small" onClick={() => handleQuantityChange(item.productId, getSizeOnly(item.size), item.quantity + 1)}>+</Button>
                                    </Box>
                                    <Typography variant="body2">Total: {formatPrice(item.price * item.quantity)}</Typography>
                                    <IconButton color="error" onClick={() => removeFromCart(item.productId, getSizeOnly(item.size))}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
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
                                                handleQuantityChange(item.productId, getSizeOnly(item.size), item.quantity - 1);
                                            }}
                                        >
                                            -
                                        </Button>
                                        {item.quantity}
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                handleQuantityChange(item.productId, getSizeOnly(item.size), item.quantity + 1);
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
                                                removeFromCart(item.productId, getSizeOnly(item.size));
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
                )
            )}

            {cart.length > 0 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="h6">
                        Total: {formatPrice(getTotalPrice())}
                    </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleClearCartInDatabase}
                            sx={{ ml: 2 }}
                        >
                            Eliminar Carrito
                        </Button>
                    </Box>
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