import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Rating,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import PaymentIcon from "@mui/icons-material/Payment";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchProductById,
  clearSelectedProduct,
} from "../../store/slices/productSlice";

const GameDetailPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "#1a1a2e",
  color: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
}));

const GameImage = styled(Box)(({ theme }) => ({
  height: 400,
  backgroundColor: "#252a34",
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: "8px",
  position: "relative",
}));

const GameBanner = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "10px",
  left: "0",
  backgroundColor: "#ff2e63",
  color: "#fff",
  padding: "4px 12px",
  borderTopRightRadius: "4px",
  borderBottomRightRadius: "4px",
  fontWeight: "bold",
  fontSize: "0.75rem",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  zIndex: 1,
}));

const PriceTag = styled(Box)(({ theme }) => ({
  backgroundColor: "#252a34",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "8px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  width: "fit-content",
}));

const BuyButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#08d9d6",
  color: "#252a34",
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: "#06b6b3",
  },
  "&.Mui-disabled": {
    backgroundColor: "#252a34",
    color: "#555",
  },
}));

const PayNowButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ff2e63",
  color: "#fff",
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: "#e0264f",
  },
  "&.Mui-disabled": {
    backgroundColor: "#252a34",
    color: "#555",
  },
}));

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct, loading, error } = useAppSelector(
    (state) => state.products
  );
  const [paymentSnackbarOpen, setPaymentSnackbarOpen] = React.useState(false);
  const [randomRating] = React.useState(Math.floor(Math.random() * 5) + 1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate("/");
  };

  const handlePayNow = () => {
    // Aquí se implementaría la integración con Wompi
    // Por ahora solo mostramos un mensaje
    setPaymentSnackbarOpen(true);
  };

  const handleClosePaymentSnackbar = () => {
    setPaymentSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          Volver a la lista de productos
        </Button>
      </Box>
    );
  }

  if (!selectedProduct) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Producto no encontrado
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          Volver a la lista de productos
        </Button>
      </Box>
    );
  }

  // Asegurarse de que el precio sea un número y tenga 2 decimales
  const formattedPrice = selectedProduct
    ? typeof selectedProduct.price === "number"
      ? selectedProduct.price.toFixed(2)
      : parseFloat(String(selectedProduct.price)).toFixed(2)
    : "0.00";

  // Características del juego (simuladas)
  const gameFeatures = [
    "Gráficos de alta calidad",
    "Multijugador en línea",
    "Historia inmersiva",
    "Actualizaciones gratuitas",
    "Compatible con controladores",
  ];

  return (
    <Box sx={{ my: 4 }}>
      <Button
        variant="outlined"
        onClick={handleBack}
        sx={{
          mb: 4,
          color: "#08d9d6",
          borderColor: "#08d9d6",
          "&:hover": {
            borderColor: "#06b6b3",
            backgroundColor: "rgba(8, 217, 214, 0.1)",
          },
        }}
      >
        ← Volver a la tienda de juegos
      </Button>

      <Snackbar
        open={paymentSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleClosePaymentSnackbar}
        message="Redirigiendo a pasarela de pago Wompi..."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <GameDetailPaper elevation={3} sx={{ p: 0, overflow: "hidden" }}>
        <Grid container>
          <Grid item xs={12} md={6} sx={{ position: "relative" }}>
            <GameImage
              sx={{
                height: { xs: 300, md: 500 },
                backgroundImage: `url(https://source.unsplash.com/random?videogame=${selectedProduct?.id})`,
              }}
            >
              {/* Banner de descuento eliminado */}
            </GameImage>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SportsEsportsIcon
                  sx={{ color: "#08d9d6", mr: 1, fontSize: 28 }}
                />
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: "bold" }}
                >
                  {selectedProduct?.name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Rating
                  name="game-rating"
                  value={randomRating}
                  readOnly
                  sx={{ color: "#ff2e63", mr: 2 }}
                />
                <Chip
                  label={`Stock: ${selectedProduct?.quantity}`}
                  sx={{
                    bgcolor: selectedProduct?.quantity
                      ? "rgba(8, 217, 214, 0.2)"
                      : "rgba(255, 46, 99, 0.2)",
                    color: selectedProduct?.quantity ? "#08d9d6" : "#ff2e63",
                    fontWeight: "bold",
                  }}
                  size="small"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <PriceTag>
                  <PaymentIcon fontSize="small" />${formattedPrice}
                </PriceTag>
              </Box>

              <Divider sx={{ my: 3, borderColor: "#252a34" }} />

              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#08d9d6", fontWeight: "bold" }}
              >
                Descripción del juego
              </Typography>

              <Typography variant="body1" paragraph sx={{ color: "#eaeaea" }}>
                {selectedProduct?.description}
              </Typography>

              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#08d9d6", fontWeight: "bold", mt: 3 }}
              >
                Características
              </Typography>

              <List dense>
                {gameFeatures.map((feature, index) => (
                  <ListItem key={index} sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: "#ff2e63" }} />
                    </ListItemIcon>
                    <ListItemText primary={feature} sx={{ color: "#eaeaea" }} />
                  </ListItem>
                ))}
              </List>

              <Box
                sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <PayNowButton
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={selectedProduct?.quantity <= 0}
                  onClick={handlePayNow}
                  startIcon={<ShoppingCartCheckoutIcon />}
                >
                  Comprar ahora con Wompi
                </PayNowButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </GameDetailPaper>
    </Box>
  );
};

export default ProductDetail;
