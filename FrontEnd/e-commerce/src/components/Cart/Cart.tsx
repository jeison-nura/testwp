import React from "react";
import {
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
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../store/slices/cartSlice";
import { DeleteIcon } from "./CartIcon"; // Usando el icono SVG personalizado

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

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
    <Box sx={{ width: "100%", p: 2 }}>
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
                          inputProps={{ min: 0, max: 99 }}
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

          <Box sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCart}
              >
                Vaciar Carrito
              </Button>
              <Button variant="contained" color="primary">
                Proceder al Pago
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Cart;
