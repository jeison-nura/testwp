import React, { ReactNode } from "react";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "../Cart/CartDrawer";
import { styled } from "@mui/material/styles";

interface LayoutProps {
  children: ReactNode;
}

// Crear un tema oscuro para la tienda de juegos
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#08d9d6",
    },
    secondary: {
      main: "#ff2e63",
    },
    background: {
      default: "#121225",
      paper: "#1a1a2e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#eaeaea",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: "hidden",
        },
      },
    },
  },
});

const MainContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  flexGrow: 1,
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#121225",
        }}
      >
        <CssBaseline />
        <Header />
        <MainContainer component="main" maxWidth="lg">
          {children}
        </MainContainer>
        <Footer />
        <CartDrawer />
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
