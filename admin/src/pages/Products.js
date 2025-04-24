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
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const AVAILABLE_SIZES = ['L', 'XL', '1XL', '2XL', '3XL', '4XL', '5XL'];

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [],
    category: '',
    featured: false,
    sizes: [],
    inventory: {} // Objeto para almacenar el inventario por talla
  });
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        sizes: data.sizes?.map(size => size.split('__')[1]) || []
      };
    });
    setProducts(productsList);
  };

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categoriesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCategories(categoriesList);
  };

  const handleOpen = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        ...product,
        price: product.price.toString(),
        images: Array.isArray(product.images) ? product.images : [product.image].filter(Boolean),
        sizes: product.sizes || [],
        inventory: product.inventory || {}
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        images: [],
        category: '',
        featured: false,
        sizes: [],
        inventory: {}
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSizeChange = (event) => {
    const selectedSizes = event.target.value;
    setFormData({
      ...formData,
      sizes: selectedSizes,
      inventory: selectedSizes.reduce((acc, size) => {
        acc[size] = formData.inventory[size] || 0;
        return acc;
      }, {})
    });
  };

  const handleInventoryChange = (size, value) => {
    setFormData({
      ...formData,
      inventory: {
        ...formData.inventory,
        [size]: parseInt(value) || 0
      }
    });
  };

  const handleAddImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      setFormData({
        ...formData,
        images: [...formData.images, newImage],
      });
      setNewImage('');
    }
  };

  const handleRemoveImage = (imageToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img !== imageToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory: formData.sizes.reduce((acc, size) => {
          acc[size] = formData.inventory[size] || 0;
          return acc;
        }, {})
      };
      
      if (selectedProduct) {
        productData.sizes = productData.sizes.map(size => `${selectedProduct.id}__${size}`);
        await updateDoc(doc(db, 'products', selectedProduct.id), productData);
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          sizes: []
        });
        
        const formattedSizes = productData.sizes.map(size => `${docRef.id}__${size}`);
        await updateDoc(docRef, {
          sizes: formattedSizes
        });
      }
      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Productos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Agregar Producto
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Imágenes</TableCell>
              <TableCell>Tallas</TableCell>
              <TableCell>Inventario</TableCell>
              <TableCell>Destacado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {Array.isArray(product.images) ? product.images.length : 1} imagen(es)
                </TableCell>
                <TableCell>
                  {product.sizes?.join(', ') || 'Sin tallas'}
                </TableCell>
                <TableCell>
                  {product.sizes?.map(size => (
                    <div key={size}>{size}: {product.inventory?.[size] || 0}</div>
                  ))}
                </TableCell>
                <TableCell>{product.featured ? 'Sí' : 'No'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)}>
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
          {selectedProduct ? 'Editar Producto' : 'Agregar Producto'}
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
            name="price"
            label="Precio"
            type="number"
            fullWidth
            value={formData.price}
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Imágenes
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label="URL de la imagen"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
              />
              <Button onClick={handleAddImage} variant="contained">
                Agregar
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.images.map((image, index) => (
                <Chip
                  key={index}
                  label={`Imagen ${index + 1}`}
                  onDelete={() => handleRemoveImage(image)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </Box>
          </Box>
          <FormControl fullWidth margin="dense">
            <InputLabel>Categoría</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Categoría"
            >
              <MenuItem value="">
                <em>Selecciona una categoría</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Tallas</InputLabel>
            <Select
              multiple
              value={formData.sizes}
              onChange={handleSizeChange}
              label="Tallas"
              renderValue={(selected) => selected.join(', ')}
            >
              {AVAILABLE_SIZES.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Inventario por talla
            </Typography>
            <Grid container spacing={2}>
              {formData.sizes.map((size) => (
                <Grid item xs={6} key={size}>
                  <TextField
                    label={`Inventario ${size}`}
                    type="number"
                    value={formData.inventory[size] || 0}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.featured}
                onChange={handleChange}
                name="featured"
              />
            }
            label="Producto Destacado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedProduct ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Products; 