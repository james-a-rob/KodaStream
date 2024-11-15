import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Link, Tooltip, Container } from '@mui/material';
import { useParams } from 'react-router-dom';

import { OpenInNew } from '@mui/icons-material';
import MediaList from '../components/MediaList';
import PlayList from '../components/PlayList';
import { fetchData } from '../services/api';

const previewLink = "https://your-stream-preview-link.com";


const Studio: React.FC = () => {
    const [eventData, setEventData] = useState<[]>([]);
    const [mediaData, setMediaData] = useState<[]>([]);
    const [analyticsData, setAnalyticsData] = useState<[]>([]);


    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useParams<{ id: string }>();

    console.log('eventData', eventData);
    console.log('mediaData', mediaData)
    console.log('analyticsData', analyticsData)

    useEffect(() => {
        const getData = async () => {
            try {
                console.log('url in', `event/${id}`)
                const eventResult = await fetchData<[]>(`event/${id}`);
                const analyticsResult = await fetchData<[]>(`event/${id}/analytics`);
                const mediaResult = await fetchData<[]>(`media`);


                setEventData(eventResult.data);
                setMediaData(mediaResult.data);
                setAnalyticsData(analyticsResult.data);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    if (loading) return <p>Loading...</p>;
    console.log('eventResult')

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h6">Studio</Typography>

            <Grid container spacing={2} sx={{ padding: 2 }}>
                {/* Full-width Card */}
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Typography variant="h5" component="div">
                                    Live Stream {eventData?.id}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    LIVE
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    style={{ marginRight: '16px' }} // Horizontal spacing between buttons
                                >
                                    End Stream
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ marginRight: '16px' }} // Horizontal spacing between buttons
                                >
                                    Go Live
                                </Button>

                                {/* Stream Preview Link with an Icon */}
                                <Tooltip title="Open stream preview in a new tab" arrow>
                                    <Link href={previewLink} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center' }}>
                                        <OpenInNew fontSize="large" color="primary" />
                                    </Link>
                                </Tooltip>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Total Viewers */}
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                Total Viewers
                            </Typography>
                            <Typography variant="h6" color="textPrimary">
                                {analyticsData?.totalViewers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Average Session Length */}
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                Avg Session Length
                            </Typography>
                            <Typography variant="h6" color="textPrimary">
                                {analyticsData?.averageSessionLength} mins
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stream Status */}
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h5" component="div" gutterBottom>
                                Engagment Rate
                            </Typography>
                            <Typography variant="h6" color="textPrimary">
                                {analyticsData?.engagementRate}%
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
                            <MediaList data={mediaData} />
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