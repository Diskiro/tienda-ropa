import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SearchBar from '../components/SearchBar/SearchBar';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        metroStation: '',
        role: 'customer'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersCollection = collection(db, 'storeUsers');
            const snapshot = await getDocs(usersCollection);
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Usuarios encontrados:', usersList);
            setUsers(usersList);
            setFilteredUsers(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
            setAlert({
                open: true,
                message: 'Error al cargar los usuarios',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            metroStation: user.metroStation || '',
            role: user.role || 'customer'
        });
        setOpenDialog(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await deleteDoc(doc(db, 'storeUsers', userId));
                setUsers(users.filter(user => user.id !== userId));
                setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
                setAlert({
                    open: true,
                    message: 'Usuario eliminado correctamente',
                    severity: 'success'
                });
            } catch (error) {
                console.error('Error deleting user:', error);
                setAlert({
                    open: true,
                    message: 'Error al eliminar el usuario',
                    severity: 'error'
                });
            }
        }
    };

    const handleUpdate = async () => {
        try {
            await updateDoc(doc(db, 'storeUsers', selectedUser.id), formData);
            setUsers(users.map(user => 
                user.id === selectedUser.id ? { ...user, ...formData } : user
            ));
            setFilteredUsers(users.map(user => 
                user.id === selectedUser.id ? { ...user, ...formData } : user
            ));
            setOpenDialog(false);
            setAlert({
                open: true,
                message: 'Usuario actualizado correctamente',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating user:', error);
            setAlert({
                open: true,
                message: 'Error al actualizar el usuario',
                severity: 'error'
            });
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Función para filtrar usuarios
    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (!searchValue) {
            setFilteredUsers(users);
            return;
        }

        const filtered = users.filter(user => {
            const searchFields = [
                user.firstName,
                user.lastName,
                user.email,
                user.phone,
                user.id,
                user.role
            ];

            return searchFields.some(field => 
                field && field.toString().toLowerCase().includes(searchValue)
            );
        });

        setFilteredUsers(filtered);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Gestión de Usuarios de la Tienda
            </Typography>
            
            <SearchBar
                searchTerm={searchTerm}
                onSearch={handleSearch}
                placeholder="Buscar por nombre, email, teléfono, ID o rol..."
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Estación de Metro</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>{user.metroStation || '-'}</TableCell>
                                <TableCell>{user.role || 'customer'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(user.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Nombre"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Apellido"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Estación de Metro"
                        name="metroStation"
                        value={formData.metroStation}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Rol"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, open: false })}
                    severity={alert.severity}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 