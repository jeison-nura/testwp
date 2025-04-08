import React, { ReactNode } from "react";
import { Box, Container, CssBaseline, ThemeProvider } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "../Cart/CartDrawer";
import { styled } from "@mui/material/styles";
import theme from "../../theme";

interface LayoutProps {
  children: ReactNode;
}

// Utilizamos el tema centralizado importado desde ../../theme

const MainContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  flexGrow: 1,
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
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
