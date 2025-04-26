import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  IconButton,
  Collapse,
  Checkbox,
  DialogActions,
} from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expiredOrders, setExpiredOrders] = useState(new Set());

  // Función para verificar si una orden debe ser cancelada por tiempo
  const checkOrderExpiration = async (order) => {
    if (order.status === 'Cancelado' || order.confirmed || expiredOrders.has(order.id)) return;

    const orderDate = order.createdAt.toDate();
    const now = new Date();
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

    if (hoursDiff >= 24) {
      setExpiredOrders(prev => new Set([...prev, order.id]));
      await handleCancelOrder(order);
    }
  };

  // Función para calcular el tiempo restante (memoizada)
  const getRemainingTime = React.useCallback((orderDate) => {
    if (!orderDate) return 'N/A';
    
    const now = new Date();
    const orderDateTime = orderDate.toDate();
    const hoursDiff = (now - orderDateTime) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, 24 - hoursDiff);
    
    if (remainingHours <= 0) return 'Expirado';
    
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    
    return `${hours}h ${minutes}m`;
  }, []);

  useEffect(() => {
    setLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const setupListener = () => {
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setOrders(ordersData);
          setLoading(false);
          retryCount = 0;

          // Verificar expiración solo de órdenes pendientes
          ordersData
            .filter(order => !order.confirmed && order.status !== 'Cancelado')
            .forEach(checkOrderExpiration);
        }, 
        (error) => {
          console.error("Error listening to orders: ", error);
          setLoading(false);
          
          if (error.code === 'unavailable' && retryCount < maxRetries) {
            retryCount++;
            console.log(`Reintentando conexión (intento ${retryCount}/${maxRetries})...`);
            setTimeout(setupListener, retryDelay * retryCount);
          } else {
            console.error("Error persistente al conectar con Firestore. Por favor, verifica tu conexión a internet.");
          }
        }
      );

      return unsubscribe;
    };

    const unsubscribe = setupListener();
    return () => unsubscribe();
  }, [expiredOrders]);

  // Función optimizada para restaurar stock
  const restoreProductStock = React.useCallback(async (items) => {
    try {
      const updates = [];
      
      for (const item of items) {
        if (!item.productId) {
          console.warn('Item sin productId:', item);
          continue;
        }

        const productRef = doc(db, 'products', item.productId);
        const productDoc = await getDoc(productRef);
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const currentInventory = productData.inventory || {};
          
          if (item.size) {
            const sizeKey = item.size;
            const currentStock = currentInventory[sizeKey] || 0;
            updates.push({
              ref: productRef,
              data: { [`inventory.${sizeKey}`]: currentStock + item.quantity }
            });
          } else {
            const currentStock = productData.stock || 0;
            updates.push({
              ref: productRef,
              data: { stock: currentStock + item.quantity }
            });
          }
        }
      }

      // Ejecutar todas las actualizaciones en paralelo
      await Promise.all(updates.map(update => updateDoc(update.ref, update.data)));
      return true;
    } catch (error) {
      console.error("Error restoring product stock: ", error);
      return false;
    }
  }, []);

  // Función optimizada para cancelar orden
  const handleCancelOrder = React.useCallback(async (order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Cancelado',
        confirmed: false
      });

      const stockRestored = await restoreProductStock(order.items);
      
      if (stockRestored) {
        console.log(`Order ${order.id} cancelled and stock restored successfully`);
      } else {
        console.error(`Order ${order.id} cancelled but there was an error restoring stock`);
      }
    } catch (error) {
      console.error("Error cancelling order: ", error);
    }
  }, [restoreProductStock]);

  const handleExpandClick = (orderId) => {
    setExpandedRowId(expandedRowId === orderId ? null : orderId);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  const handleConfirmChange = async (event, order) => {
    const newConfirmedStatus = event.target.checked;
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        confirmed: newConfirmedStatus,
        status: newConfirmedStatus ? 'Confirmado' : 'Pendiente'
      });
      console.log(`Order ${order.id} confirmed status updated to ${newConfirmedStatus}`);
    } catch (error) {
      console.error("Error updating order confirmation status: ", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Órdenes
      </Typography>
      {loading ? (
        <Typography>Cargando órdenes...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Confirmado</TableCell>
                <TableCell>Tiempo Restante</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => handleExpandClick(order.id)}
                      >
                        {expandedRowId === order.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {order.id}
                    </TableCell>
                    <TableCell>{order.customerName || order.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{order.customerPhone || order.customer?.phone || 'N/A'}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>{order.status || 'Pendiente'}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={order.confirmed || false}
                        onChange={(event) => handleConfirmChange(event, order)}
                        disabled={order.status === 'Cancelado'}
                        inputProps={{ 'aria-label': 'confirm order' }}
                      />
                    </TableCell>
                    <TableCell>
                      {order.status !== 'Cancelado' && !order.confirmed ? 
                        getRemainingTime(order.createdAt) : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                        sx={{ mr: 1 }}
                      >
                        Ver Detalles
                      </Button>
                      {order.status !== 'Cancelado' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleCancelOrder(order)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                      <Collapse in={expandedRowId === order.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Detalles del Pedido
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Email:</strong> {order.customer?.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Teléfono:</strong> {order.customer?.phone || 'N/A'}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Método Envío:</strong> {order.shippingMethod === 'metro' ? `Metro (${order.metroStation})` : 'Domicilio'}
                          </Typography>
                          {order.shippingMethod === 'home' && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Dirección:</strong> {order.shippingAddress?.address || ''}, {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''}, {order.shippingAddress?.zipCode || ''}
                            </Typography>
                          )}
                          <Typography variant="body2" gutterBottom>
                            <strong>Método Pago:</strong> {order.paymentMethod || 'N/A'}
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 2 }}>
                            Productos
                          </Typography>
                          <List>
                            {order.items?.map((item, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={item.name}
                                  secondary={`Cantidad: ${item.quantity} - Precio: ${formatPrice(item.price)}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                          <Typography variant="h6" sx={{ mt: 2 }}>
                            Total: {formatPrice(order.total)}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Orden</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <DialogContentText>
                <strong>ID de la Orden:</strong> {selectedOrder.id}
              </DialogContentText>
              <DialogContentText>
                <strong>Cliente:</strong> {selectedOrder.customerName || selectedOrder.customer?.name || 'N/A'}
              </DialogContentText>
              <DialogContentText>
                <strong>Email:</strong> {selectedOrder.customerEmail || selectedOrder.customer?.email || 'N/A'}
              </DialogContentText>
              <DialogContentText>
                <strong>Fecha:</strong> {formatDate(selectedOrder.createdAt)}
              </DialogContentText>
              <DialogContentText>
                <strong>Estado:</strong> {selectedOrder.status}
              </DialogContentText>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Productos
              </Typography>
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Cantidad: ${item.quantity} - Precio: ${formatPrice(item.price)}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: {formatPrice(selectedOrder.total)}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Orders; 