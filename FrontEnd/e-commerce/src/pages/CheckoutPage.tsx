import React from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { clearCart } from "../store/slices/cartSlice";
import Layout from "../components/Layout/Layout";

const steps = ["Información de envío", "Método de pago", "Confirmación"];

const CheckoutPage: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState(false);
  const { items } = useAppSelector((state) => state.cart);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Verificar si el carrito está vacío
  React.useEffect(() => {
    if (items.length === 0 && !completed) {
      navigate("/");
    }
  }, [items, navigate, completed]);

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setCompleted(true);
      dispatch(clearCart());
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Información de envío
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="firstName"
                  name="firstName"
                  label="Nombre"
                  fullWidth
                  autoComplete="given-name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="lastName"
                  name="lastName"
                  label="Apellido"
                  fullWidth
                  autoComplete="family-name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="address1"
                  name="address1"
                  label="Dirección"
                  fullWidth
                  autoComplete="shipping address-line1"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="city"
                  name="city"
                  label="Ciudad"
                  fullWidth
                  autoComplete="shipping address-level2"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="zip"
                  name="zip"
                  label="Código Postal"
                  fullWidth
                  autoComplete="shipping postal-code"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  fullWidth
                  autoComplete="tel"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Método de pago
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  id="cardName"
                  label="Nombre en la tarjeta"
                  fullWidth
                  autoComplete="cc-name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  id="cardNumber"
                  label="Número de tarjeta"
                  fullWidth
                  autoComplete="cc-number"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  id="expDate"
                  label="Fecha de expiración"
                  fullWidth
                  autoComplete="cc-exp"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  id="cvv"
                  label="CVV"
                  helperText="Últimos tres dígitos en la franja de firma"
                  fullWidth
                  autoComplete="cc-csc"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del pedido
            </Typography>
            <List disablePadding>
              {items.map((item) => (
                <ListItem key={item.product.id} sx={{ py: 1, px: 0 }}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`Cantidad: ${item.quantity}`}
                  />
                  <Typography variant="body2">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Total" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </ListItem>
            </List>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Envío
                </Typography>
                <Typography gutterBottom>John Doe</Typography>
                <Typography gutterBottom>
                  Calle Principal 123, Ciudad
                </Typography>
              </Grid>
              <Grid item container direction="column" xs={12} sm={6}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Detalles de pago
                </Typography>
                <Typography gutterBottom>Tarjeta terminada en 1234</Typography>
                <Typography gutterBottom>Expiración: 04/2024</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Paper sx={{ p: { xs: 2, md: 3 }, my: { xs: 3, md: 6 } }}>
        {completed ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h5" gutterBottom>
              ¡Gracias por tu compra!
            </Typography>
            <Typography variant="subtitle1">
              Tu número de pedido es #2001539. Hemos enviado un correo
              electrónico con la confirmación de tu pedido y te enviaremos una
              actualización cuando tu pedido haya sido enviado.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoToHome}
              sx={{ mt: 3, ml: 1 }}
            >
              Volver a la tienda
            </Button>
          </Box>
        ) : (
          <>
            <Typography component="h1" variant="h4" align="center">
              Checkout
            </Typography>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {renderStepContent(activeStep)}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Atrás
                </Button>
              )}
              <Button variant="contained" onClick={handleNext}>
                {activeStep === steps.length - 1
                  ? "Realizar pedido"
                  : "Siguiente"}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Layout>
  );
};

export default CheckoutPage;
