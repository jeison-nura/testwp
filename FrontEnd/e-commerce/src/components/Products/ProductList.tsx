import React, { useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchProducts } from "../../store/slices/productSlice";
import ProductCard from "./ProductCard";
import { styled } from "@mui/material/styles";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const GameStoreTitle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "2rem",
  backgroundColor: "#252a34",
  padding: "1rem 1.5rem",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
}));

const GameGrid = styled(Grid)(({ theme }) => ({
  position: "relative",
}));

const GameBackground = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#121225",
  zIndex: -1,
}));

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress sx={{ color: "#08d9d6" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ my: 4, textAlign: "center", color: "#fff" }}>
        <Typography variant="h5">No hay juegos disponibles</Typography>
      </Box>
    );
  }

  return (
    <>
      <GameBackground />
      <GameStoreTitle>
        <SportsEsportsIcon sx={{ fontSize: 32, color: "#08d9d6", mr: 2 }} />
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", color: "#fff" }}
        >
          Tienda de Juegos
        </Typography>
      </GameStoreTitle>

      <GameGrid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </GameGrid>
    </>
  );
};

export default ProductList;
