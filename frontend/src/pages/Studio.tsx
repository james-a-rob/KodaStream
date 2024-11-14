import React from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import MediaList from '../components/MediaList';
import PlayList from '../components/PlayList';


const Studio: React.FC = () => {

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h6">Studio</Typography>

            <Grid container spacing={2} sx={{ padding: 2 }}>
                {/* Full-width Card */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                Live Stream 1
                            </Typography>
                            <Typography variant="body2">
                                LIVE
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Two Split Grids */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                Media
                            </Typography>
                            <MediaList data={{}} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" component="div">
                                Playlist
                            </Typography>
                            <Typography variant="body2">
                                <PlayList data={{}} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Studio;