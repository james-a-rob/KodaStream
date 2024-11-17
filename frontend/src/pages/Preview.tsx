import React from 'react';
import { Typography, Container } from '@mui/material';
import Preview from '../components/Video';

const Home: React.FC = () => {
    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h6">Preview</Typography>
            <Preview id={"1"} />
        </Container>
    );
};

export default Home;