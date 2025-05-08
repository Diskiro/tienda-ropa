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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import DownloadIcon from '@mui/icons-material/Download';
import SearchBar from '../components/SearchBar/SearchBar';

const AVAILABLE_SIZES = ['L', 'XL', '1XL', '2XL', '3XL', '4XL', '5XL'];

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
    inventory: {}
  });
  const [newImage, setNewImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        sizes: data.sizes || []
      };
    });
    setProducts(productsList);
    setFilteredProducts(productsList);
    setLoading(false);
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
        inventory: AVAILABLE_SIZES.reduce((acc, size) => {
          acc[`new__${size}`] = 0;
          return acc;
        }, {})
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

  const handleInventoryChange = (size, value) => {
    const sizeKey = `${selectedProduct ? selectedProduct.id : 'new'}__${size}`;
    setFormData({
      ...formData,
      inventory: {
        ...formData.inventory,
        [sizeKey]: parseInt(value) || 0
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
        price: parseFloat(formData.price)
      };
      
      if (selectedProduct) {
        const filteredInventory = Object.entries(productData.inventory).reduce((acc, [key, value]) => {
          if (value > 0) {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        await updateDoc(doc(db, 'products', selectedProduct.id), {
          ...productData,
          inventory: filteredInventory
        });
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          inventory: {}
        });
        
        const formattedInventory = AVAILABLE_SIZES.reduce((acc, size) => {
          const stock = formData.inventory[`new__${size}`] || 0;
          if (stock > 0) {
            acc[`${docRef.id}__${size}`] = stock;
          }
          return acc;
        }, {});
        
        await updateDoc(docRef, {
          inventory: formattedInventory
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

  const downloadCSV = () => {
    const headers = ['ID', 'Nombre', 'Precio', 'Descripción', 'Categoría', 'Imágenes', 'Inventario', 'Destacado'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => {
        const inventory = AVAILABLE_SIZES.map(size => {
          const sizeKey = `${product.id}__${size}`;
          const stock = product.inventory?.[sizeKey] || 0;
          return `${size}:${stock}`;
        }).filter(Boolean).join(';');

        const images = Array.isArray(product.images) ? product.images.join(';') : product.image || '';

        return [
          product.id,
          `"${product.name}"`,
          product.price,
          `"${product.description || ''}"`,
          `"${product.category || ''}"`,
          `"${images}"`,
          `"${inventory}"`,
          product.featured ? 'Sí' : 'No'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'productos.csv';
    link.click();
  };

  const downloadJSON = () => {
    const jsonData = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || '',
      images: Array.isArray(product.images) ? product.images : [product.image].filter(Boolean),
      inventory: AVAILABLE_SIZES.reduce((acc, size) => {
        const sizeKey = `${product.id}__${size}`;
        const stock = product.inventory?.[sizeKey] || 0;
        if (stock > 0) {
          acc[size] = stock;
        }
        return acc;
      }, {}),
      featured: product.featured || false
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'productos.json';
    link.click();
  };

  // Función para filtrar productos
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (!searchValue) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      const searchFields = [
        product.name,
        product.description,
        product.category,
        product.id,
        product.sku
      ];

      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchValue)
      );
    });

    setFilteredProducts(filtered);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Productos
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadCSV}
            sx={{ mr: 1 }}
          >
            Descargar CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadJSON}
          >
            Descargar JSON
          </Button>
        </Box>
      </Box>
      <SearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        placeholder="Buscar por nombre, descripción, categoría, ID o SKU..."
      />
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
              <TableCell>Inventario</TableCell>
              <TableCell>Destacado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {Array.isArray(product.images) ? product.images.length : 1} imagen(es)
                </TableCell>
                <TableCell>
                  {AVAILABLE_SIZES.map(size => {
                    const sizeKey = `${product.id}__${size}`;
                    const stock = product.inventory?.[sizeKey] || 0;
                    if (stock > 0) {
                      return `${size}: ${stock}, `;
                    }
                    return null;
                  }).filter(Boolean)}
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={product.featured || false}
                        disabled
                      />
                    }
                    label=""
                  />
                </TableCell>
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Inventario por talla
            </Typography>
            <Grid container spacing={2}>
              {AVAILABLE_SIZES.map((size) => (
                <Grid item xs={6} sm={4} md={3} key={size}>
                  <TextField
                    label={`Talla ${size}`}
                    type="number"
                    value={formData.inventory[`${selectedProduct ? selectedProduct.id : 'new'}__${size}`] || 0}
                    onChange={(e) => handleInventoryChange(size, e.target.value)}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
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