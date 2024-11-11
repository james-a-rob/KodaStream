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
        fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
        fontSize: 14,
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
            color: '#333333',
        },
        h2: {
            fontSize: '1.75rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 500,
        },
        body1: {
            fontSize: '1rem',
            color: '#333333',
        },
        body2: {
            fontSize: '0.875rem',
            color: '#666666',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
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
