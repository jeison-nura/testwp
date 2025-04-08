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
  transition: theme.transitions.create(["transform", "box-shadow"]),
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  width: "100%",
  height: "500px", // Altura fija para todas las tarjetas
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[10],
  },
}));

// Contenedor con dimensiones fijas para garantizar consistencia
const CardContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "500px", // Altura fija para el contenedor
  display: "flex",
}));

const PriceTag = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.header,
  color: theme.palette.text.primary,
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.shape.borderRadius,
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const BuyButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
  },
}));

const PayNowButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
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
            backgroundColor: (theme) => theme.palette.background.header,
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
            <SportsEsportsIcon
              sx={{ color: (theme) => theme.palette.primary.main, mr: 1 }}
            />
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
            sx={{ mb: 1, color: (theme) => theme.palette.secondary.main }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
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
              sx={(theme) => ({
                bgcolor:
                  product.quantity > 0
                    ? `${theme.palette.primary.main}33`
                    : `${theme.palette.secondary.main}33`,
                color:
                  product.quantity > 0
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main,
              })}
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
