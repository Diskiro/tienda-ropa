import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Tab,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Link
} from '@mui/material';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/priceUtils';
import {
    StyledContainer,
    StyledPaper,
    StyledAvatar,
    StyledProfileBox,
    StyledDivider,
    StyledEditButton,
    StyledOrderItem,
    StyledOrderHeader,
    StyledOrderDate,
    StyledTabs,
    StyledEmptyState,
    StyledLoadingContainer,
    StyledErrorContainer,
    StyledGrid
} from './User.styles';

// Componente para mostrar la información del usuario
const UserProfile = React.memo(({ userData, onEditProfile }) => (
    <StyledPaper elevation={3}>
        <StyledProfileBox>
            <StyledAvatar>
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
            </StyledAvatar>
            <Typography variant="h5" gutterBottom>
                {userData?.firstName} {userData?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
                {userData?.email}
            </Typography>
        </StyledProfileBox>

        <StyledDivider />

        <List>
            <ListItem>
                <ListItemText
                    primary="Teléfono"
                    secondary={userData?.phone || 'No especificado'}
                />
            </ListItem>
            <ListItem>
                <ListItemText
                    primary="Estación de metro"
                    secondary={userData?.metroStation || 'No especificada'}
                />
            </ListItem>
        </List>

        <StyledEditButton
            variant="outlined"
            fullWidth
            onClick={onEditProfile}
        >
            Editar Perfil
        </StyledEditButton>
    </StyledPaper>
));

// Componente para mostrar una orden individual
const OrderItem = React.memo(({ order, onOrderClick }) => {
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

    return (
        <StyledOrderItem
            component="div"
            onClick={() => onOrderClick(order.id)}
            role="button"
            aria-label={`Ver detalles del pedido ${order.id}`}
        >
            <Box sx={{ width: '100%' }}>
                <StyledOrderHeader>
                    <Typography variant="subtitle1" component="span">
                        ID del pedido: {order.id}
                    </Typography>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                    />
                </StyledOrderHeader>
                <StyledOrderDate variant="body2" component="div">
                    {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    <br />
                    Total: {formatPrice(order.totalAmount)}
                </StyledOrderDate>
                {order.status?.toLowerCase() === 'pendiente' && (
                    <Box sx={{ 
                        mt: 1, 
                        p: 1, 
                        bgcolor: 'warning.light', 
                        borderRadius: 1,
                        color: 'warning.contrastText'
                    }}>
                        <Typography variant="body2" component="div">
                            Tienes 24 horas para enviar tu recibo de pago a este{' '}
                            <Link 
                                href="https://wa.me/527224992307" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ 
                                    color: 'warning.contrastText',
                                    textDecoration: 'underline',
                                    '&:hover': {
                                        color: 'warning.dark'
                                    }
                                }}
                            >
                                WhatsApp
                            </Link>
                        </Typography>
                    </Box>
                )}
            </Box>
        </StyledOrderItem>
    );
});

// Hook personalizado para manejar la lógica de datos del usuario
const useUserData = (userId) => {
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userDoc, ordersSnapshot] = await Promise.all([
                    getDoc(doc(db, 'storeUsers', userId)),
                    getDocs(query(
                        collection(db, 'orders'),
                        orderBy('id'),
                        startAt(`${userId}__`),
                        endAt(`${userId}__\uf8ff`)
                    ))
                ]);

                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }

                const ordersData = ordersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).reverse();
                setOrders(ordersData);
            } catch (err) {
                console.error('Error al cargar datos del usuario:', err);
                setError('Error al cargar los datos. Por favor, intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    return { userData, orders, loading, error };
};

const User = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const { userData, orders, loading, error } = useUserData(user?.uid);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOrderClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handleEditProfile = () => {
        navigate('/profile/edit');
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <StyledLoadingContainer maxWidth="lg">
                <CircularProgress />
            </StyledLoadingContainer>
        );
    }

    if (error) {
        return (
            <StyledErrorContainer maxWidth="lg">
                <Alert severity="error">{error}</Alert>
            </StyledErrorContainer>
        );
    }

    return (
        <StyledContainer maxWidth="lg">
            <StyledGrid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <UserProfile 
                        userData={userData} 
                        onEditProfile={handleEditProfile} 
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <StyledPaper elevation={3}>
                        <StyledTabs
                            value={activeTab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label="Mis Pedidos" />
                            <Tab label="Favoritos" />
                            <Tab label="Configuración" />
                        </StyledTabs>

                        {activeTab === 0 && (
                            <Box>
                                {orders.length === 0 ? (
                                    <StyledEmptyState variant="body1">
                                        No tienes pedidos realizados
                                    </StyledEmptyState>
                                ) : (
                                    <List>
                                        {orders.map((order) => (
                                            <React.Fragment key={order.id}>
                                                <OrderItem 
                                                    order={order} 
                                                    onOrderClick={handleOrderClick} 
                                                />
                                                <StyledDivider />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <StyledEmptyState variant="body1">
                                Próximamente: Lista de productos favoritos
                            </StyledEmptyState>
                        )}

                        {activeTab === 2 && (
                            <StyledEmptyState variant="body1">
                                Próximamente: Configuración de cuenta
                            </StyledEmptyState>
                        )}
                    </StyledPaper>
                </Grid>
            </StyledGrid>

            <Snackbar
                open={snackbar.open} 
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default User; 