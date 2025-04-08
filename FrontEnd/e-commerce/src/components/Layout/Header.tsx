import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";

const GameAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#252a34",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  margin: theme.spacing(0, 1),
  "&:hover": {
    backgroundColor: "rgba(8, 217, 214, 0.1)",
  },
}));

const Header: React.FC = () => {
  return (
    <GameAppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <LogoBox sx={{ mr: 2, display: { xs: "none", md: "flex" } }}>
            <SportsEsportsIcon sx={{ fontSize: 28, color: "#08d9d6", mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              GameStore
            </Typography>
          </LogoBox>

          <Box sx={{ flexGrow: 1, display: "flex" }}>
            <NavButton
              component={RouterLink}
              to="/"
              startIcon={<VideogameAssetIcon />}
            >
              Juegos
            </NavButton>
            <NavButton
              component={RouterLink}
              to="/"
              startIcon={<SportsEsportsIcon />}
            >
              Novedades
            </NavButton>
          </Box>

          <Box sx={{ flexGrow: 0 }}>{/* Carrito de compras eliminado */}</Box>
        </Toolbar>
      </Container>
    </GameAppBar>
  );
};

export default Header;
