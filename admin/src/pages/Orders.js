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
} from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const ordersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setOrders(ordersList);
  };

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Órdenes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(order)}
                  >
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                      secondary={`Cantidad: ${item.quantity} - Precio: $${item.price}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ${selectedOrder.total}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Orders; 