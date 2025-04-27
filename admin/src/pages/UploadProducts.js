import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

function UploadProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          complete: async (results) => {
            await processProducts(results.data);
          },
          header: true,
        });
      } else if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const products = JSON.parse(e.target.result);
          await processProducts(products);
        };
        reader.readAsText(file);
      } else {
        setError('Formato de archivo no soportado. Use CSV o JSON.');
      }
    } catch (err) {
      setError('Error al procesar el archivo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
  });

  const processProducts = async (products) => {
    try {
      let processedCount = 0;
      for (const product of products) {
        if (!product.name || !product.price) continue;
        
        try {
          const productData = {
            name: product.name,
            price: parseFloat(product.price),
            description: product.description || '',
            image: product.image || '',
            category: product.category || '',
            featured: product.featured === 'true'
          };

          let docRef;
          if (product.id) {
            // Verificar si el documento existe antes de actualizar
            const docSnap = await getDoc(doc(db, 'products', product.id));
            if (docSnap.exists()) {
              docRef = doc(db, 'products', product.id);
              await updateDoc(docRef, productData);
            } else {
              // Si no existe, crear uno nuevo
              docRef = await addDoc(collection(db, 'products'), productData);
            }
          } else {
            // Crear nuevo producto
            docRef = await addDoc(collection(db, 'products'), productData);
          }

          // Procesar el inventario si existe
          if (product.inventory) {
            const inventoryItems = product.inventory.split(';');
            const formattedInventory = {};
            inventoryItems.forEach(item => {
              const [size, quantity] = item.split(':');
              const quantityNum = parseInt(quantity);
              // Solo agregar al inventario si la cantidad es mayor que 0
              if (size && quantityNum > 0) {
                formattedInventory[`${docRef.id}__${size}`] = quantityNum;
              }
            });
            
            if (Object.keys(formattedInventory).length > 0) {
              await updateDoc(docRef, { inventory: formattedInventory });
            }
          }

          processedCount++;
        } catch (err) {
          console.error(`Error procesando producto ${product.name}:`, err);
          continue;
        }
      }
      
      setSuccess(`Se han procesado ${processedCount} productos correctamente.`);
    } catch (err) {
      setError('Error al guardar los productos: ' + err.message);
    }
  };

  const handleJsonSubmit = async () => {
    if (!jsonInput) {
      setError('Por favor, ingrese los datos en formato JSON.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const products = JSON.parse(jsonInput);
      await processProducts(products);
      setJsonInput('');
    } catch (err) {
      setError('Error al procesar el JSON: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Subir Productos
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            textAlign: 'center',
            border: '2px dashed #ccc',
            cursor: 'pointer',
            backgroundColor: isDragActive ? '#f0f0f0' : 'white',
          }}
        >
          <input {...getInputProps()} />
          <Typography>
            {isDragActive
              ? 'Suelta el archivo aquí...'
              : 'Arrastra y suelta un archivo CSV o JSON aquí, o haz clic para seleccionar'}
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom>
        O ingresa los datos en formato JSON:
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='[{"name": "Producto 1", "price": 100, "description": "Descripción", "image": "url", "category": "Categoría"}]'
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleJsonSubmit}
        disabled={loading}
      >
        Subir JSON
      </Button>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </div>
  );
}

export default UploadProducts; 