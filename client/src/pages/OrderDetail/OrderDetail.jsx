import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    CircularProgress,
    Button
} from '@mui/material';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatPrice } from '../../utils/priceUtils';
import { useAuth } from '../../context/AuthContext';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderDoc = await getDoc(doc(db, 'orders', orderId));
                if (!orderDoc.exists()) {
                    setError('Pedido no encontrado');
                    return;
                }

                const orderData = orderDoc.data();
                if (orderData.userId !== user.uid) {
                    setError('No tienes permiso para ver este pedido');
                    return;
                }

                setOrder(orderData);
            } catch (err) {
                console.error('Error al cargar el pedido:', err);
                setError('Error al cargar el pedido');
            } finally {
                setLoading(false);
            }
        };

        if (orderId && user) {
            fetchOrder();
        }
    }, [orderId, user]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pendiente':
                return 'warning';
            case 'completado':
                return 'success';
            case 'cancelado':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error" variant="h6" gutterBottom>
                        {error}
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/user')}>
                        Volver a mis pedidos
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Detalles del Pedido #{orderId}
                    </Typography>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                        Fecha: {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            Productos
                        </Typography>
                        <List>
                            {order.items.map((item, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2">
                                                        Talla: {item.size.split('__')[1]}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant="body2">
                                                        Cantidad: {item.quantity}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                        <Typography variant="body1">
                                            {formatPrice(parseFloat(item.price) * parseInt(item.quantity))}
                                        </Typography>
                                    </ListItem>
                                    {index < order.items.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Resumen del Pedido
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemText primary="Subtotal" />
                                    <Typography>
                                        {formatPrice(
                                            order.items.reduce((total, item) => 
                                                total + (parseFloat(item.price) * parseInt(item.quantity)), 
                                            0
                                            )
                                        )}
                                    </Typography>
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="Envío" />
                                    <Typography>$40</Typography>
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="Total" />
                                    <Typography variant="h6">
                                        {formatPrice(
                                            order.items.reduce((total, item) => 
                                                total + (parseFloat(item.price) * parseInt(item.quantity)), 
                                            0
                                            ) + 40
                                        )}
                                    </Typography>
                                </ListItem>
                            </List>
                        </Paper>

                        {order.status?.toLowerCase() === 'pendiente' && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                                <Typography variant="body2" color="warning.contrastText">
                                    Tienes 24 horas para enviar tu recibo de pago a este{' '}
                                    <a 
                                        href="https://wa.me/527224992307" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            color: 'inherit',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        WhatsApp
                                    </a>
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/user')}
                    >
                        Volver a mis pedidos
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default OrderDetail; 