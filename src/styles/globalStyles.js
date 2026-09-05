import { createTheme } from '@mui/material/styles';

// Cyan Color Palette
const cyan = {
  50: '#e0f7fa',
  100: '#b2ebf2',
  200: '#80deea',
  300: '#4dd0e1',
  400: '#26c6da',
  500: '#00bcd4', // Main Cyan
  600: '#00acc1',
  700: '#0097a7',
  800: '#00838f',
  900: '#006064',
};

export const modernTheme = createTheme({
  palette: {
    primary: {
      main: cyan[500],
      light: cyan[300],
      dark: cyan[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff8e8e',
      dark: '#ff4757',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#718096',
    },
    success: {
      main: '#48bb78',
      light: '#68d391',
    },
    warning: {
      main: '#ed8936',
      light: '#fbd38d',
    },
    error: {
      main: '#f56565',
      light: '#fc8181',
    },
    info: {
      main: cyan[500],
      light: cyan[300],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${cyan[500]} 0%, ${cyan[300]} 100%)`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          fontSize: '0.95rem',
          position: 'relative',
          overflow: 'hidden',
        },
        contained: {
          background: `linear-gradient(135deg, ${cyan[500]} 0%, ${cyan[400]} 100%)`,
          boxShadow: '0 2px 8px rgba(0, 188, 212, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 188, 212, 0.3)',
            transform: 'translateY(-1px)',
            background: `linear-gradient(135deg, ${cyan[600]} 0%, ${cyan[500]} 100%)`,
          },
        },
        outlined: {
          border: `2px solid ${cyan[200]}`,
          color: cyan[600],
          '&:hover': {
            border: `2px solid ${cyan[300]}`,
            backgroundColor: `${cyan[50]}`,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 8px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
  },
});