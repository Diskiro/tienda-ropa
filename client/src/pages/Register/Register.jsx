import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Snackbar,
    Grid
} from '@mui/material';
import { useAuth } from '../../context/auth/useAuth';
import styles from './Register.module.css';

export function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        metroStation: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register, alert, closeAlert } = useAuth();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName) {
            newErrors.firstName = 'El nombre es requerido';
        }

        if (!formData.lastName) {
            newErrors.lastName = 'El apellido es requerido';
        }

        if (!formData.email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Ingresa un correo electrónico válido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.phone) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Ingresa un número de teléfono válido (10 dígitos)';
        }

        if (!formData.metroStation) {
            newErrors.metroStation = 'La estación de metro es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si es el campo de teléfono, solo permitir números
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpiar el error cuando el usuario comienza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const userId = await register(formData);
            if (userId) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Crear Cuenta
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }} className={styles.formContainer}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                required
                                className={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Apellido"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                required
                                className={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Correo Electrónico"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                                className={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Contraseña"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                required
                                className={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Confirmar Contraseña"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                required
                                className={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                required
                                inputProps={{ 
                                    maxLength: 10,
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*'
                                }}
                                className={styles.inputField}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                label="Estación de Metro más cercana"
                                name="metroStation"
                                value={formData.metroStation}
                                onChange={handleChange}
                                error={!!errors.metroStation}
                                helperText={errors.metroStation}
                                required
                                className={styles.inputField}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3 }}
                        className={styles.registerButton}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </Button>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            ¿Ya tienes una cuenta?{' '}
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                Inicia sesión aquí
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={closeAlert}
            >
                <Alert
                    onClose={closeAlert}
                    severity={alert.severity}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
} 