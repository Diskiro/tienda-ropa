import { Container, Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Divider, Box } from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';

const cartItems = ["ola"]; // Tus items del carrito

export default function CartPage() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 15;
    const total = subtotal + shipping;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tu Carrito
            </Typography>

            {cartItems.length === 0 ? (
                <Box textAlign="center" sx={{ py: 8 }}>
                    <Typography variant="h5" gutterBottom>
                        Tu carrito está vacío
                    </Typography>
                    <Button variant="contained" href="/catalogo">
                        Continuar comprando
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        <TableCell align="center">Talla</TableCell>
                                        <TableCell align="center">Cantidad</TableCell>
                                        <TableCell align="right">Precio</TableCell>
                                        <TableCell align="right"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cartItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        style={{ width: '60px', marginRight: '16px' }}
                                                    />
                                                    <Typography>{item.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">{item.size}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <IconButton size="small">
                                                        <Remove />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                                    <IconButton size="small">
                                                        <Add />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Resumen del pedido
                            </Typography>

                            <Box sx={{ my: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Subtotal:</Typography>
                                    <Typography>${subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Envío:</Typography>
                                    <Typography>${shipping.toFixed(2)}</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">Total:</Typography>
                                    <Typography variant="h6">${total.toFixed(2)}</Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                href="/checkout"
                            >
                                Proceder al pago
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}