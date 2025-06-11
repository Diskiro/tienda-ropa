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
  Card,
  CardMedia,
  CardActionArea
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, DragIndicator as DragIcon } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import SearchBar from '../components/SearchBar/SearchBar';

function SortableCategory({ category, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton {...attributes} {...listeners} size="small">
            <DragIcon />
          </IconButton>
        </Box>
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
        <IconButton onClick={() => onEdit(category)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(category.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function Categories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
      setFilteredCategories(categoriesList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleOpen = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        order: category.order || 0
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        order: categories.length
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        order: formData.order
      };

      if (selectedCategory) {
        await updateDoc(doc(db, 'categories', selectedCategory.id), categoryData);
      } else {
        await addDoc(collection(db, 'categories'), categoryData);
      }

      handleClose();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error al eliminar la categoría');
      }
    }
  };

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
        category.description
      ];

      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchValue)
      );
    });

    setFilteredCategories(filtered);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex(item => item.id === active.id);
      const newIndex = categories.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(categories, oldIndex, newIndex);
      
      // Actualizar ambos estados
      setCategories(newItems);
      setFilteredCategories(newItems);
      
      // Actualizar el orden en Firestore
      newItems.forEach(async (category, index) => {
        try {
          await updateDoc(doc(db, 'categories', category.id), {
            order: index
          });
        } catch (error) {
          console.error('Error updating category order:', error);
        }
      });
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Categorías</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Agregar Categoría
        </Button>
      </Box>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        placeholder="Buscar por nombre o descripción..."
      />

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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredCategories.map(cat => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredCategories.map((category) => (
                  <SortableCategory
                    key={category.id}
                    category={category}
                    onEdit={handleOpen}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="URL de la imagen"
              name="image"
              value={formData.image}
              onChange={handleChange}
              margin="normal"
            />
            {formData.image && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCategory ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Categories; 