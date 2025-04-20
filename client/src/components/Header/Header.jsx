import { AppBar, Toolbar, IconButton, Badge, Menu, MenuItem, Button, Box } from '@mui/material';
import { ShoppingCart, WhatsApp, Menu as MenuIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const categories = ['Vestidos', 'Blusas', 'Pantalones', 'Accesorios'];

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="sticky" color="default" elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/assets/logo.png" alt="Charys Clothes" height="40" />
                </Link>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                    {categories.map(category => (
                        <Button
                            key={category}
                            component={Link}
                            to={`/catalogo?category=${category.toLowerCase()}`}
                            sx={{ textTransform: 'none' }}
                        >
                            {category}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        color="inherit"
                        href="https://wa.me/7224992307"
                        target="_blank"
                        sx={{ color: 'success.main' }}
                    >
                        <WhatsApp />
                    </IconButton>

                    <IconButton color="inherit" component={Link} to="/carrito">
                        <Badge badgeContent={3} color="primary">
                            <ShoppingCart />
                        </Badge>
                    </IconButton>

                    <IconButton
                        color="inherit"
                        onClick={handleMenuOpen}
                        sx={{ display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>

                {/* Menú móvil */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {categories.map(category => (
                        <MenuItem
                            key={category}
                            component={Link}
                            to={`/catalogo?category=${category.toLowerCase()}`}
                            onClick={handleMenuClose}
                        >
                            {category}
                        </MenuItem>
                    ))}
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
export default Header;