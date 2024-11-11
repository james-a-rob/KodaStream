import React from 'react';
import { Container, Typography } from '@mui/material';
import MediaList from '../components/MediaList';


const Media: React.FC = () => {

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="body1">Media</Typography>

            <MediaList data={{}} />
        </Container>
    );
};

export default Media;