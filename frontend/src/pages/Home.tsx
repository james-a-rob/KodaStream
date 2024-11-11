import React from 'react';
import { Typography, Container } from '@mui/material';
import EventList from '../components/StreamList';

const Home: React.FC = () => {
    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="body1">Streams</Typography>
            <EventList data={{}} />
        </Container>
    );
};

export default Home;