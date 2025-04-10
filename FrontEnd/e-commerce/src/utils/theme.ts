// This file helps with the transition from Material UI to Tailwind
// You can use these values to maintain consistency with your existing design

export const spacing = (value: number) => `${value * 0.5}rem`;

export const theme = {
  palette: {
    primary: {
      main: '#08d9d6',
      dark: '#06a8a6',
      light: '#5ee7e5',
      contrastText: '#252a34',
    },
    secondary: {
      main: '#ff2e63',
      dark: '#d42552',
      light: '#ff6a8e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121225',
      paper: '#252a34',
      header: '#1a1e27',
    },
    text: {
      primary: '#eaeaea',
      secondary: '#b2b2b2',
      disabled: '#6c6c6c',
    },
  },
  shape: {
    borderRadius: '0.375rem',
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    '0 20px 40px rgba(0, 0, 0, 0.2)',
  ],
};