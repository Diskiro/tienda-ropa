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

const steps = ['Envío', 'Pago', 'Revisión'];

export default function CheckoutPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePaymentChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    // Datos simulados del carrito
    const cartItems = [
        { id: 1, name: 'Vestido floral', price: 59.99, quantity: 1, size: 'M' },
        { id: 2, name: 'Blusa de seda', price: 39.99, quantity: 2, size: 'S' }
    ];

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 15.00;
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Apellido"
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Dirección"
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Ciudad"
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Estado/Provincia"
                                        variant="outlined"
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Código postal"
                                        variant="outlined"
                                        margin="normal"
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
                                    <TextField
                                        required
                                        fullWidth
                                        label="Correo electrónico"
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
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Nombre en la tarjeta"
                                                    variant="outlined"
                                                    margin="normal"
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
                                                />
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="CVV"
                                                    variant="outlined"
                                                    margin="normal"
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
                                Juan Pérez<br />
                                Calle Falsa 123<br />
                                Ciudad de México, CDMX 03810<br />
                                México<br />
                                Tel: 55 1234 5678<br />
                                juan.perez@example.com
                            </Typography>

                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Método de pago:
                            </Typography>
                            <Typography paragraph>
                                Tarjeta de crédito terminada en 4242
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
                                    ${(item.price * item.quantity).toFixed(2)}
                                </Typography>
                            </Box>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Subtotal:</Typography>
                            <Typography>${subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Envío:</Typography>
                            <Typography>${shipping.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Impuestos:</Typography>
                            <Typography>${tax.toFixed(2)}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Total:</Typography>
                            <Typography variant="h6">${total.toFixed(2)}</Typography>
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