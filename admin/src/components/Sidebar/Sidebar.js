import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    ShoppingCart as ProductsIcon,
    Category as CategoriesIcon,
    People as UsersIcon,
    Upload as UploadIcon,
    ListAlt as OrdersIcon
} from '@mui/icons-material';

const drawerWidth = 240;

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Productos', icon: <ProductsIcon />, path: '/products' },
        { text: 'Categorías', icon: <CategoriesIcon />, path: '/categories' },
        { text: 'Pedidos', icon: <OrdersIcon />, path: '/orders' },
        { text: 'Subir Productos', icon: <UploadIcon />, path: '/upload' },
        { text: 'Usuarios', icon: <UsersIcon />, path: '/users' }
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f5'
                }
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" component="div">
                    Panel de Administración
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        component={Link}
                        to={item.path}
                        key={item.text}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.12)'
                                }
                            }
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
} 