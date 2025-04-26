import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    TextField,
    FormControlLabel,
    Checkbox,
    Divider,
    Radio,
    RadioGroup,
    Paper,
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    Link as MuiLink,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/priceUtils';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { db } from '../../firebase';
import { collection, doc, runTransaction, Timestamp, increment, getDoc } from 'firebase/firestore';

const steps = ['Envío', 'Pago', 'Revisión'];

export default function CheckoutPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('transfer');
    const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
    const [shippingMethod, setShippingMethod] = useState('metro');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        metroStation: ''
    });
    const { user } = useAuth();
    const { cart, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            setFormData(prevData => ({
                ...prevData,
                name: `${user.firstName} ${user.lastName}` || '',
                email: user.email || '',
                phone: user.phone || '',
                metroStation: user.metroStation || ''
            }));
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePaymentChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || cart.length === 0) {
            setSnackbar({ open: true, message: 'Error: No hay usuario o el carrito está vacío.', severity: 'error' });
            return;
        }
        setIsProcessing(true);

        try {
            let newOrderRef;
            await runTransaction(db, async (transaction) => {
                // Obtener o crear el contador de pedidos del usuario
                const userOrdersCounterRef = doc(db, 'userOrdersCounters', user.uid);
                const counterDoc = await transaction.get(userOrdersCounterRef);
                
                let orderNumber = 1;
                if (counterDoc.exists()) {
                    orderNumber = counterDoc.data().count + 1;
                }
                
                // Crear el ID del pedido
                const orderId = `${user.uid}__orden${orderNumber}`;
                newOrderRef = doc(db, 'orders', orderId);

                const orderData = {
                    id: orderId,
                    userId: user.uid,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    shippingMethod: shippingMethod,
                    metroStation: user.metroStation || '',
                    paymentMethod: paymentMethod,
                    items: cart,
                    totalAmount: total,
                    status: 'Pendiente',
                    confirmed: false,
                    createdAt: Timestamp.now()
                };

                // Crear el pedido
                transaction.set(newOrderRef, orderData);
                
                // Actualizar el contador de pedidos del usuario
                transaction.set(userOrdersCounterRef, { count: orderNumber }, { merge: true });

                // Actualizar el inventario
                for (const item of cart) {
                    if (!item.productId || !item.size || !item.size.includes('__')) {
                        console.warn('Item inválido en el carrito, omitiendo actualización de stock:', item);
                        throw new Error(`Item inválido en el carrito: ${item.name || 'Producto desconocido'}. No se pudo procesar el pedido.`);
                    }

                    const productRef = doc(db, 'products', item.productId);
                    const sizeKey = item.size;
                    
                    transaction.update(productRef, { 
                        [`inventory.${sizeKey}`]: increment(-item.quantity) 
                    });
                }
            });

            setSnackbar({ open: true, message: 'Pedido realizado con éxito.', severity: 'success' });
            await clearCart();
            navigate('/confirmation', { 
                state: { 
                    order: {
                        id: newOrderRef.id,
                        userId: user.uid,
                        customerName: formData.name,
                        customerEmail: formData.email,
                        customerPhone: formData.phone,
                        shippingMethod: shippingMethod,
                        metroStation: user.metroStation || '',
                        paymentMethod: paymentMethod,
                        items: cart,
                        subtotal: subtotal,
                        shippingCost: shipping,
                        total: total,
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    }
                } 
            });

        } catch (error) {
            console.error("Error al procesar el pedido: ", error);
            setSnackbar({ open: true, message: `Error al procesar el pedido: ${error.message}`, severity: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const subtotal = getTotalPrice();
    const shipping = 40;
    const total = subtotal + shipping;

    const getSizeOnly = (size) => {
        return size ? size.split('__')[1] : '';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    {activeStep === 0 && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Información de envío
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Método de envío
                                </Typography>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'primary.light', 
                                    borderRadius: 1,
                                    color: 'white',
                                    mb: 2
                                }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Envío a estación de metro más cercana ($40.00)
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Para coordinar el envío y recibo de tu producto comunícate a este WhatsApp:
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<WhatsAppIcon />}
                                        component={MuiLink}
                                        href="https://wa.me/527224992307"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ 
                                            textTransform: 'none',
                                            bgcolor: '#25D366',
                                            '&:hover': {
                                                bgcolor: '#128C7E'
                                            }
                                        }}
                                    >
                                        Contactar por WhatsApp
                                    </Button>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Nombre"
                                        variant="outlined"
                                        margin="normal"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Email"
                                        variant="outlined"
                                        margin="normal"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Teléfono"
                                        variant="outlined"
                                        margin="normal"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Estación de metro"
                                        variant="outlined"
                                        margin="normal"
                                        name="metroStation"
                                        value={user?.metroStation || ''}
                                        disabled
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {activeStep === 1 && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Método de pago
                            </Typography>

                            <RadioGroup value={paymentMethod} onChange={handlePaymentChange}>
                                <FormControlLabel
                                    value="transfer"
                                    control={<Radio />}
                                    label="Transferencia bancaria"
                                />

                                {paymentMethod === 'transfer' && (
                                    <Box sx={{ ml: 4, mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Datos para transferencia:
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            <strong>Nombre:</strong> Arlenne Medel Mayen
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Banco:</strong> Banamex
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>No de Tarjeta:</strong> 5204 1658 9896 0293
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            <strong>Nombre:</strong> Arlenne Medel Mayen
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Banco:</strong> BBVA
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>No de Cuenta:</strong> 4152 3138 5301 8351
                                        </Typography>
                                    </Box>
                                )}

                                <FormControlLabel
                                    value="oxxo"
                                    control={<Radio />}
                                    label="Depósito por OXXO"
                                />

                                {paymentMethod === 'oxxo' && (
                                    <Box sx={{ ml: 4, mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Datos para depósito en OXXO:
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            <strong>Nombre:</strong> Arlenne Medel Mayen
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Banco:</strong> Banamex
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>No de Tarjeta:</strong> 5204165898960293
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            <strong>Nombre:</strong> Arlenne Medel Mayen
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Banco:</strong> BBVA
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>No de Cuenta:</strong> 4152313853018351
                                        </Typography>
                                    </Box>
                                )}
                            </RadioGroup>
                        </Paper>
                    )}

                    {activeStep === 2 && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Revisión del pedido
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Información de envío:
                            </Typography>
                            <Typography paragraph>
                                <strong>Nombre:</strong> {formData.name}<br />
                                <strong>Email:</strong> {formData.email}<br />
                                <strong>Teléfono:</strong> {formData.phone}<br />
                                <strong>Estación de metro:</strong> {user?.metroStation || 'No especificada'}<br />
                                <strong>Método de envío:</strong> Envío a estación de metro más cercana
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Método de pago:
                            </Typography>
                            <Typography paragraph>
                                {paymentMethod === 'transfer' && 'Transferencia bancaria'}
                                {paymentMethod === 'oxxo' && 'Depósito por OXXO'}
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Resumen:
                            </Typography>
                            {cart.map((item) => (
                                <Box key={`${item.id}-${item.size}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography sx={{ mr: 2.5 }}>
                                        {item.name} ({getSizeOnly(item.size)}) × {item.quantity}
                                    </Typography>
                                    <Typography sx={{ whiteSpace: 'nowrap' }}>
                                        {formatPrice(item.price * item.quantity)}
                                    </Typography>
                                </Box>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>{formatPrice(subtotal)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography>Envío:</Typography>
                                <Typography>{formatPrice(shipping)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">{formatPrice(total)}</Typography>
                            </Box>

                            <Box sx={{ 
                                mt: 3, 
                                p: 2, 
                                bgcolor: '#f5f5f5', 
                                borderRadius: 1,
                                border: '1px dashed #9e9e9e'
                            }}>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Tienes 24 horas para enviar tu recibo de pago a este WhatsApp:
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<WhatsAppIcon />}
                                    component={MuiLink}
                                    href="https://wa.me/527224992307"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ 
                                        textTransform: 'none',
                                        bgcolor: '#25D366',
                                        '&:hover': {
                                            bgcolor: '#128C7E'
                                        }
                                    }}
                                >
                                    Contactar por WhatsApp
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button
                            disabled={activeStep === 0 || isProcessing}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Regresar
                        </Button>

                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={isProcessing || cart.length === 0}
                            >
                                {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Confirmar pedido'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                disabled={isProcessing}
                            >
                                Continuar
                            </Button>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 16 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Resumen del pedido
                        </Typography>

                        {cart.map((item) => (
                            <Box key={`${item.id}-${item.size}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography sx={{ mr: 2.5 }}>
                                    {item.name} ({getSizeOnly(item.size)}) × {item.quantity}
                                </Typography>
                                <Typography sx={{ whiteSpace: 'nowrap' }}>
                                    {formatPrice(item.price * item.quantity)}
                                </Typography>
                            </Box>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal:</Typography>
                            <Typography>{formatPrice(subtotal)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Envío:</Typography>
                            <Typography>{formatPrice(shipping)}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Total:</Typography>
                            <Typography variant="h6">{formatPrice(total)}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

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
}