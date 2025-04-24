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
} from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Confirmado</TableCell>
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
                    <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>{order.status || 'Pendiente'}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={order.confirmed || false}
                        onChange={(event) => handleConfirmChange(event, order)}
                        inputProps={{ 'aria-label': 'confirm order' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        Ver Detalles
                      </Button>
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
                <strong>Cliente:</strong> {selectedOrder.customer?.name || 'N/A'}
              </DialogContentText>
              <DialogContentText>
                <strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}
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