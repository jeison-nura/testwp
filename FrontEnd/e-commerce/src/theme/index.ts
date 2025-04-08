import { createTheme } from "@mui/material/styles";

// Paleta de colores centralizada
const colors = {
  primary: {
    main: "#08d9d6",
    light: "#06b6b3",
    dark: "#06a5a2",
    contrastText: "#252a34",
  },
  secondary: {
    main: "#ff2e63",
    light: "#e0264f",
    dark: "#d01f45",
    contrastText: "#ffffff",
  },
  background: {
    default: "#121225",
    paper: "#1a1a2e",
    card: "#1a1a2e",
    header: "#252a34",
    footer: "#252a34",
  },
  text: {
    primary: "#ffffff",
    secondary: "#eaeaea",
    disabled: "#555555",
  },
  action: {
    disabled: "#252a34",
    disabledBackground: "#252a34",
  },
  common: {
    white: "#ffffff",
    black: "#000000",
  },
};

// Dimensiones consistentes para componentes
const dimensions = {
  card: {
    height: 500,
    imageHeight: 200,
    borderRadius: 12,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
};

// Efectos visuales
const effects = {
  boxShadow: "0 12px 20px rgba(0, 0, 0, 0.4)",
  transition: "transform 0.3s, box-shadow 0.3s",
  hover: {
    transform: "translateY(-8px)",
  },
};

// Tema principal de la aplicación
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: dimensions.borderRadius.medium,
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: dimensions.card.borderRadius,
          overflow: "hidden",
        },
      },
    },
  },
});

// Exportar el tema y las constantes para uso en componentes
export { colors, dimensions, effects };
export default theme;
