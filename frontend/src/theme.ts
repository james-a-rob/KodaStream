import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3A8DFF', // Soft but vibrant blue
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FF6F61', // Complementary soft red
            contrastText: '#ffffff',
        },
        background: {
            default: '#F5F7FA', // Light grey for a modern dashboard background
            paper: '#ffffff', // Clean white for cards and modals
        },
        text: {
            primary: '#333333', // Deep grey for primary text
            secondary: '#666666', // Softer grey for secondary text
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif', // default body font
        h1: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontWeight: 700, // Bold for headers
            fontSize: '2rem',
        },
        h2: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontWeight: 700,
            fontSize: '1.75rem',
        },
        h3: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontWeight: 500,
            fontSize: '1.5rem',
        },
        h4: {
            fontFamily: 'Poppins, Arial, sans-serif',
            fontWeight: 100,
            fontSize: '1.25rem',
        },
        body1: {
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: '1rem',
        },
        body2: {
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: '0.875rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    padding: '8px 16px',
                    boxShadow: 'none'
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#333333',
                    boxShadow: 'none',
                    borderBottom: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 6,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3A8DFF',
                        },
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#3A8DFF',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                },
            },
        },
    },
});

export default theme;
