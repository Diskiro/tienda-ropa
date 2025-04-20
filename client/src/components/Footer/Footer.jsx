import { Box, Container, Grid, Typography, Link, Divider, IconButton} from '@mui/material';
import { Facebook, Instagram, Twitter, WhatsApp } from '@mui/icons-material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                py: 6,
                mt: 'auto'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Logo y descripción */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Charys Clothes Store
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Tu destino para moda femenina: ropa exclusiva y accesorios elegantes.
                        </Typography>

                        {/* Redes sociales */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <IconButton href="#" sx={{ color: 'white' }}>
                                <Facebook />
                            </IconButton>
                            <IconButton href="#" sx={{ color: 'white' }}>
                                <Instagram />
                            </IconButton>
                            <IconButton href="#" sx={{ color: 'white' }}>
                                <Twitter />
                            </IconButton>
                            <IconButton href="#" sx={{ color: 'white' }}>
                                <WhatsApp />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Categorías */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Categorías
                        </Typography>
                        <Box component="nav">
                            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                                Vestidos
                            </Link>
                            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                                Blusas
                            </Link>
                            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                                Pantalones
                            </Link>
                            <Link href="#" color="inherit" underline="hover" display="block">
                                Accesorios
                            </Link>
                        </Box>
                    </Grid>

                    {/* Información */}
                    <Grid item xs={6} md={2}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Información
                        </Typography>
                        <Box component="nav">
                            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                                Sobre Nosotros
                            </Link>
                            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                                Envíos y Devoluciones
                            </Link>
                            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
                                Términos y Condiciones
                            </Link>
                            <Link href="#" color="inherit" underline="hover" display="block">
                                Política de Privacidad
                            </Link>
                        </Box>
                    </Grid>

                    {/* Contacto */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Contacto
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <Box component="span" sx={{ fontWeight: 'bold' }}>Dirección:</Box> Calle Moda #456, Ciudad
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <Box component="span" sx={{ fontWeight: 'bold' }}>Email:</Box> info@charysclothes.com
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            <Box component="span" sx={{ fontWeight: 'bold' }}>Teléfono:</Box> (555) 123-4567
                        </Typography>

                        {/* Horario */}
                        <Typography variant="body1">
                            <Box component="span" sx={{ fontWeight: 'bold' }}>Horario:</Box> Lunes a Viernes 9am-6pm
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                {/* Derechos de autor */}
                <Typography variant="body2" align="center">
                    © {new Date().getFullYear()} Charys Clothes Store. Todos los derechos reservados.
                </Typography>
            </Container>
        </Box>
    );
}
export default Footer;