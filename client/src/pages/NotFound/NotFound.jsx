import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center',
                    py: 4
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '8rem', md: '12rem' },
                        fontWeight: 'bold',
                        color: 'primary.main',
                        mb: 2
                    }}
                >
                    404
                </Typography>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        color: 'text.secondary'
                    }}
                >
                    ¡Ups! Página no encontrada
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        mb: 4,
                        maxWidth: '600px',
                        color: 'text.secondary'
                    }}
                >
                    Lo sentimos, la página que estás buscando no existe o ha sido movida.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/')}
                    sx={{
                        px: 4,
                        py: 1.5
                    }}
                >
                    Volver al inicio
                </Button>
            </Box>
        </Container>
    );
} 