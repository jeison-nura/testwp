import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/product.types";
import { styled } from "@mui/material/styles";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PaymentIcon from "@mui/icons-material/Payment";

const GameCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s, box-shadow 0.3s",
  borderRadius: "12px",
  overflow: "hidden",
  backgroundColor: "#1a1a2e",
  color: "#fff",
  width: "100%",
  height: "500px", // Altura fija para todas las tarjetas
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.4)",
  },
}));

// Contenedor con dimensiones fijas para garantizar consistencia
const CardContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "500px", // Altura fija para el contenedor
  display: "flex",
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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [randomRating] = React.useState(Math.floor(Math.random() * 5) + 1);

  const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };

  // Asegurarse de que el precio sea un número y tenga 2 decimales
  const formattedPrice =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : parseFloat(String(product.price)).toFixed(2);

  return (
    <CardContainer>
      <GameCard>
        <CardMedia
          component="div"
          sx={{
            height: 200, // Altura fija para la imagen
            backgroundColor: "#252a34",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            width: "100%",
          }}
          image={`https://source.unsplash.com/random?videogame=${product.id}`}
        />
        <CardContent
          sx={{
            flexGrow: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <SportsEsportsIcon sx={{ color: "#08d9d6", mr: 1 }} />
            <Typography
              gutterBottom
              variant="h6"
              component="h2"
              sx={{ fontWeight: "bold", m: 0 }}
            >
              {product.name}
            </Typography>
          </Box>

          <Rating
            name="game-rating"
            value={randomRating}
            readOnly
            size="small"
            sx={{ mb: 1, color: "#ff2e63" }}
          />

          <Typography
            variant="body2"
            color="#eaeaea"
            sx={{
              mb: 2,
              height: "3em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              maxHeight: "3em",
            }}
          >
            {product.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto", // Empuja este elemento hacia abajo
              mb: 2,
            }}
          >
            <Box>
              <PriceTag>
                <PaymentIcon fontSize="small" />${formattedPrice}
              </PriceTag>
            </Box>
            <Chip
              label={`Stock: ${product.quantity}`}
              size="small"
              sx={{
                bgcolor:
                  product.quantity > 0
                    ? "rgba(8, 217, 214, 0.2)"
                    : "rgba(255, 46, 99, 0.2)",
                color: product.quantity > 0 ? "#08d9d6" : "#ff2e63",
              }}
            />
          </Box>
        </CardContent>

        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            mt: "auto", // Asegura que el botón esté en la parte inferior
          }}
        >
          <BuyButton
            variant="contained"
            fullWidth
            onClick={handleViewDetails}
            disabled={product.quantity <= 0}
            startIcon={<SportsEsportsIcon />}
          >
            Ver juego
          </BuyButton>
        </Box>
      </GameCard>
    </CardContainer>
  );
};

export default ProductCard;
