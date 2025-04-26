import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Divider,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { formatPrice } from '../../utils/priceUtils';

const ConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.order) {
            setOrder(location.state.order);
            setLoading(false);
        } else {
            // Si no hay datos del pedido, redirigir al inicio
            navigate('/');
        }
    }, [location, navigate]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h5" align="center">
                    Cargando...
                </Typography>
            </Container>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CheckCircleOutlineIcon 
                        color="success" 
                        sx={{ fontSize: 80, mb: 2 }} 
                    />
                    <Typography variant="h4" gutterBottom>
                        ¡Pedido Confirmado!
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Gracias por tu compra. Tu pedido ha sido recibido y está siendo procesado.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Detalles del Pedido
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Número de Pedido"
                                    secondary={order.id}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Fecha"
                                    secondary={new Date(order.createdAt).toLocaleDateString()}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Estado"
                                    secondary={order.status}
                                />
                            </ListItem>
                        </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Dirección de Envío
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary={order.customerName}
                                    secondary={order.metroStation}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Email"
                                    secondary={order.customerEmail}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Teléfono"
                                    secondary={order.customerPhone}
                                />
                            </ListItem>
                        </List>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Productos
                        </Typography>
                        <List>
                            {order.items.map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemAvatar>
                                        <Avatar 
                                            src={item.image} 
                                            alt={item.name}
                                            variant="square"
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`Talla: ${item.size.split('__')[1]} - Cantidad: ${item.quantity}`}
                                    />
                                    <Typography variant="body1">
                                        {formatPrice(item.price * item.quantity)}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: '50px' }}>
                            <Typography variant="h6">Subtotal</Typography>
                            <Typography variant="h6">{formatPrice(order.subtotal)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: '50px' }}>
                            <Typography variant="h6">Envío</Typography>
                            <Typography variant="h6">{formatPrice(order.shippingCost)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: '50px' }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6">{formatPrice(order.total)}</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/')}
                    >
                        Volver al Inicio
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/orders')}
                    >
                        Ver Mis Pedidos
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ConfirmationPage;