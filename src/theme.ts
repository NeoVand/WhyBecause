import { createTheme, PaletteMode } from '@mui/material';
import { blue, purple, grey } from '@mui/material/colors';

// Create theme generator function for consistent theme settings
export const createAppTheme = (mode: PaletteMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: blue[700],
        light: blue[500],
        dark: blue[900],
      },
      secondary: {
        main: purple[500],
        light: purple[300],
        dark: purple[700],
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? grey[900] : grey[100],
        secondary: mode === 'light' ? grey[700] : grey[300],
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif'
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light' 
              ? '0px 2px 10px rgba(0, 0, 0, 0.05)' 
              : '0px 2px 10px rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
  });
};

// Pre-created themes for convenience
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark'); 