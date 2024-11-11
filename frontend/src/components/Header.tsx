import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';


interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                    <Button color="inherit" component={Link} to="/">
                        Home
                    </Button>
                    <Button color="inherit" component={Link} to="/media">
                        Media
                    </Button>
                    <Button color="inherit" component={Link} to="/studio">
                        Studio
                    </Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Header;