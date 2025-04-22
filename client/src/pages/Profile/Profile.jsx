import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { useUser } from '../../context/UserContext';
import { formatPrice } from '../../utils/priceUtils';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ProfilePage() {
    const { userData, updateUserData, orders, favorites, loading } = useUser();
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        metroStation: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                metroStation: userData.metroStation || ''
            });
        }
    }, [userData]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await updateUserData(formData);
        setSnackbar({
            open: true,
            message: success ? 'Datos actualizados correctamente' : 'Error al actualizar los datos',
            severity: success ? 'success' : 'error'
        });
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Mi Cuenta
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Mis Datos" />
                    <Tab label="Mis Pedidos" />
                    <Tab label="Mis Favoritos" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Apellido"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Estación de Metro más cercana"
                                    name="metroStation"
                                    value={formData.metroStation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                >
                                    Guardar Cambios
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    {orders.length === 0 ? (
                        <Typography>No tienes pedidos realizados</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {orders.map(order => (
                                <Grid item xs={12} key={order.id}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6">
                                            Pedido #{order.id}
                                        </Typography>
                                        <Typography>
                                            Fecha: {new Date(order.date).toLocaleDateString()}
                                        </Typography>
                                        <Typography>
                                            Total: {formatPrice(order.total)}
                                        </Typography>
                                        <Typography>
                                            Estado: {order.status}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    {favorites.length === 0 ? (
                        <Typography>No tienes productos favoritos</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {favorites.map(product => (
                                <Grid item xs={12} sm={6} md={4} key={product.id}>
                                    {/* Aquí puedes usar el componente ProductCard */}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
} 