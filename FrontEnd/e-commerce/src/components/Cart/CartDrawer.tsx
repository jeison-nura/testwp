import React from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  closeCart,
} from "../../store/slices/cartSlice";

const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isOpen } = useAppSelector((state) => state.cart);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={handleClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6" component="div" gutterBottom>
          Carrito de Compras
        </Typography>

        {items.length === 0 ? (
          <Typography variant="body1" sx={{ my: 4, textAlign: "center" }}>
            Tu carrito está vacío
          </Typography>
        ) : (
          <>
            <List sx={{ width: "100%" }}>
              {items.map((item) => (
                <React.Fragment key={item.product.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveItem(item.product.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={item.product.name}
                        src={`https://source.unsplash.com/random?product=${item.product.id}`}
                        variant="rounded"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <Typography variant="body2" component="span">
                            ${item.product.price.toFixed(2)}
                          </Typography>
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 0) {
                                handleUpdateQuantity(item.product.id, value);
                              }
                            }}
                            InputProps={{ inputProps: { min: 1 } }}
                            sx={{ width: 60, ml: 2 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>

            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "grey.100", borderRadius: 1 }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCart}
              >
                Vaciar carrito
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/checkout"
                onClick={handleClose}
              >
                Proceder al pago
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
