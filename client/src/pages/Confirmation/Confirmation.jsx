import { Container, Typography, Box, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function ConfirmationPage() {
    return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />

            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                ¡Gracias por tu compra!
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                Tu pedido #12345 ha sido confirmado
            </Typography>

            <Typography paragraph sx={{ mb: 4 }}>
                Hemos enviado los detalles de tu pedido a tu correo electrónico.
                Recibirás una notificación cuando tu pedido haya sido enviado.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    component={Link}
                    to="/catalogo"
                    size="large"
                >
                    Seguir comprando
                </Button>

                <Button
                    variant="outlined"
                    component={Link}
                    to="/"
                    size="large"
                >
                    Volver al inicio
                </Button>
            </Box>
        </Container>
    );
}