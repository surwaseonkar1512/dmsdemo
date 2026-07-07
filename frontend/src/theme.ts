import { createTheme } from '@mui/material/styles';

const baseOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 600, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none' as const, fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
          borderRadius: '16px',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseOptions,
  palette: {
    mode: 'light',
    primary: { main: '#4361ee', light: '#4895ef', dark: '#3f37c9' },
    secondary: { main: '#f72585', light: '#b5179e', dark: '#7209b7' },
    background: { default: '#f8f9fa', paper: '#ffffff' },
    text: { primary: '#212529', secondary: '#6c757d' },
  },
});

export const darkTheme = createTheme({
  ...baseOptions,
  palette: {
    mode: 'dark',
    primary: { main: '#4cc9f0', light: '#48cae4', dark: '#0077b6' },
    secondary: { main: '#f72585', light: '#b5179e', dark: '#7209b7' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#f8f9fa', secondary: '#adb5bd' },
  },
});
