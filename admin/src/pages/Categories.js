import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import SearchBar from '../components/SearchBar/SearchBar';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const categoriesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCategories(categoriesList);
    setFilteredCategories(categoriesList);
    setLoading(false);
  };

  const handleOpen = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData(category);
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        order: categories.length,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await updateDoc(doc(db, 'categories', selectedCategory.id), formData);
      } else {
        await addDoc(collection(db, 'categories'), formData);
      }
      handleClose();
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const moveCategory = async (categoryId, direction) => {
    const currentIndex = categories.findIndex(cat => cat.id === categoryId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const categoryToMove = categories[currentIndex];
    const categoryToSwap = categories[newIndex];

    try {
      // Actualizar el orden de ambas categorías
      await updateDoc(doc(db, 'categories', categoryToMove.id), {
        order: categoryToSwap.order
      });
      await updateDoc(doc(db, 'categories', categoryToSwap.id), {
        order: categoryToMove.order
      });

      fetchCategories();
    } catch (error) {
      console.error('Error al mover la categoría:', error);
    }
  };

  // Función para filtrar categorías
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (!searchValue) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category => {
      const searchFields = [
        category.name,
        category.description,
        category.id
      ];

      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchValue)
      );
    });

    setFilteredCategories(filtered);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Categorías
      </Typography>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        placeholder="Buscar por nombre, descripción o ID..."
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Agregar Categoría
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Orden</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Imagen</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <IconButton 
                    onClick={() => moveCategory(category.id, 'up')}
                    disabled={categories.indexOf(category) === 0}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => moveCategory(category.id, 'down')}
                    disabled={categories.indexOf(category) === categories.length - 1}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  {category.image && (
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Editar Categoría' : 'Agregar Categoría'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="image"
            label="URL de la imagen"
            fullWidth
            value={formData.image}
            onChange={handleChange}
            helperText="Ingresa la URL de la imagen de la categoría"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCategory ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Categories; 