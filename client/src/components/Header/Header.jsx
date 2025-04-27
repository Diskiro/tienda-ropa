import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Box,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Header.css';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [categories, setCategories] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'categories'));
                const categoriesList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoriesList);
            } catch (error) {
                console.error('Error al obtener categorías:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleProfile = () => {
        navigate('/user');
        handleClose();
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <AppBar position="static" className="header">
            <Toolbar>
                <Link to="/" className="logo-link">
                    <Typography variant="h6" component="div" className="logo">
                        Tienda de Ropa
                    </Typography>
                </Link>

                {!isMobile ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                color="inherit"
                                component={Link}
                                to={`/catalogo?category=${category.name}`}
                            >
                                {category.name}
                            </Button>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ flexGrow: 1 }} />
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton 
                        color="inherit" 
                        component={Link} 
                        to="/cart"
                        sx={{ 
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                transform: 'scale(1.1)',
                                transition: 'all 0.3s ease'
                            }
                        }}
                    >
                        <Badge badgeContent={cart.length} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>

                    {isMobile && (
                        <IconButton
                            color="inherit"
                            onClick={toggleMobileMenu}
                            sx={{ 
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {user ? (
                        <>
                            <Typography variant="body1" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                                Bienvenido {user.firstName || user.email}
                            </Typography>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleProfile}>Mi Perfil</MenuItem>
                                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                            <Button color="inherit" onClick={handleLogin}>
                                Iniciar Sesión
                            </Button>
                            <Button color="inherit" onClick={handleRegister}>
                                Registrarse
                            </Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>

            {/* Menú móvil */}
            {isMobile && mobileMenuOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 64,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'white',
                        zIndex: 1100,
                        overflowY: 'auto',
                        padding: 2,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                component={Link}
                                to={`/catalogo?category=${category.name}`}
                                onClick={toggleMobileMenu}
                                sx={{
                                    color: 'text.primary',
                                    justifyContent: 'flex-start',
                                    padding: '12px 16px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                {category.name}
                            </Button>
                        ))}
                        {!user && (
                            <>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => {
                                        toggleMobileMenu();
                                        handleLogin();
                                    }}
                                    sx={{ mt: 2 }}
                                >
                                    Iniciar Sesión
                                </Button>
                                <Button
                                    color="primary"
                                    variant="outlined"
                                    onClick={() => {
                                        toggleMobileMenu();
                                        handleRegister();
                                    }}
                                >
                                    Registrarse
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            )}
        </AppBar>
    );
};

export default Header;