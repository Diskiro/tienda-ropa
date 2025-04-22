import { useState } from 'react';
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
    StepLabel
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/priceUtils';

const steps = ['Envío', 'Pago', 'Revisión'];

export default function CheckoutPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica para procesar el pago
        console.log('Procesando pago...', formData);
    };

    // Datos simulados del carrito
    const cartItems = [
        { id: 1, name: 'Vestido floral', price: 599.99, quantity: 1, size: 'M' },
        { id: 2, name: 'Blusa de seda', price: 399.99, quantity: 2, size: 'S' }
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 99.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

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
                {/* Formulario y métodos de pago */}
                <Grid item xs={12} md={7}>
                    {activeStep === 0 && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Información de envío
                            </Typography>

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
                                        label="Correo electrónico"
                                        variant="outlined"
                                        margin="normal"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Dirección"
                                        variant="outlined"
                                        margin="normal"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Ciudad"
                                        variant="outlined"
                                        margin="normal"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Estado/Provincia"
                                        variant="outlined"
                                        margin="normal"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Código postal"
                                        variant="outlined"
                                        margin="normal"
                                        name="zipCode"
                                        value={formData.zipCode}
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
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={shippingSameAsBilling}
                                                onChange={(e) => setShippingSameAsBilling(e.target.checked)}
                                            />
                                        }
                                        label="Usar esta dirección para facturación"
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
                                    value="credit-card"
                                    control={<Radio />}
                                    label="Tarjeta de crédito/débito"
                                />

                                {paymentMethod === 'credit-card' && (
                                    <Box sx={{ ml: 4, mb: 3 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Número de tarjeta"
                                                    variant="outlined"
                                                    margin="normal"
                                                    name="cardNumber"
                                                    value={formData.cardNumber}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Nombre en la tarjeta"
                                                    variant="outlined"
                                                    margin="normal"
                                                    name="cardName"
                                                    value={formData.cardName}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Expira"
                                                    placeholder="MM/AA"
                                                    variant="outlined"
                                                    margin="normal"
                                                    name="expiryDate"
                                                    value={formData.expiryDate}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="CVV"
                                                    variant="outlined"
                                                    margin="normal"
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}

                                <FormControlLabel
                                    value="paypal"
                                    control={<Radio />}
                                    label="PayPal"
                                />

                                <FormControlLabel
                                    value="bank-transfer"
                                    control={<Radio />}
                                    label="Transferencia bancaria"
                                />
                            </RadioGroup>
                        </Paper>
                    )}

                    {activeStep === 2 && (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Revisa tu pedido
                            </Typography>

                            <Typography paragraph>
                                Por favor revisa que toda la información sea correcta antes de confirmar tu compra.
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Dirección de envío:
                            </Typography>
                            <Typography paragraph>
                                {formData.name}<br />
                                {formData.address}<br />
                                {formData.city}, {formData.state} {formData.zipCode}<br />
                                México<br />
                                Tel: 55 1234 5678<br />
                                {formData.email}
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Método de pago:
                            </Typography>
                            <Typography paragraph>
                                {paymentMethod === 'credit-card' ? 'Tarjeta de crédito terminada en ' + formData.cardNumber.slice(-4) : ''}
                            </Typography>
                        </Paper>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Regresar
                        </Button>

                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to="/confirmacion"
                                onClick={handleSubmit}
                            >
                                Confirmar pedido
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                            >
                                Continuar
                            </Button>
                        )}
                    </Box>
                </Grid>

                {/* Resumen del pedido */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 16 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Resumen del pedido
                        </Typography>

                        {cartItems.map((item) => (
                            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography>
                                    {item.name} ({item.size}) × {item.quantity}
                                </Typography>
                                <Typography>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Impuestos:</Typography>
                            <Typography>{formatPrice(tax)}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Total:</Typography>
                            <Typography variant="h6">{formatPrice(total)}</Typography>
                        </Box>

                        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                            * Los impuestos se calculan al finalizar la compra
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}