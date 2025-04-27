import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, CircularProgress, Box } from '@mui/material';
import {
  ShoppingCart as ProductsIcon,
  Category as CategoriesIcon,
  Receipt as OrdersIcon,
} from '@mui/icons-material';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    products: 0,
    categories: 0,
    orders: 0
  });

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [productsSnapshot, categoriesSnapshot, ordersSnapshot] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'orders'))
        ]);

        setTotals({
          products: productsSnapshot.size,
          categories: categoriesSnapshot.size,
          orders: ordersSnapshot.size
        });
      } catch (error) {
        console.error('Error fetching totals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <ProductsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Total Productos</Typography>
              <Typography variant="h4">{totals.products}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <CategoriesIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">Total Categorías</Typography>
              <Typography variant="h4">{totals.categories}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <OrdersIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">Total Órdenes</Typography>
              <Typography variant="h4">{totals.orders}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default Dashboard; 