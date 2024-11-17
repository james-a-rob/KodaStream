import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Link, Tooltip, Container } from '@mui/material';
import { useParams } from 'react-router-dom';

import { OpenInNew } from '@mui/icons-material';
import MediaList from '../components/MediaList';
import PlayList from '../components/PlayList';
import { fetchData, postData } from '../services/api';



const Studio: React.FC = () => {
    const [eventData, setEventData] = useState<[]>([]);
    const [mediaData, setMediaData] = useState<[]>([]);
    const [analyticsData, setAnalyticsData] = useState<[]>([]);
    const [playlist, setPlaylist] = useState<[]>([]);



    const [loading, setLoading] = useState<boolean>(true);
    const { id } = useParams<{ id: string }>();

    const previewLink = `/preview/${id}`;


    console.log('eventData', eventData);
    console.log('mediaData', mediaData);
    console.log('analyticsData', analyticsData);
    console.log('updatedPlaylist', setPlaylist)


    useEffect(() => {
        const getData = async () => {
            try {
                console.log('url in', `event/${id}`)
                const eventResult = await fetchData<[]>(`events/${id}`);
                const mediaResult = await fetchData<[]>(`media`);
                const analyticsResult = await fetchData<[]>(`events/${id}/analytics`);


                setEventData(eventResult.data);
                setMediaData(mediaResult.data);
                setAnalyticsData(analyticsResult.data);
                setPlaylist(eventResult.data.scenes)

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    const handleGoLive = async () => {
        eventData.status = "started";
        eventData.scenes = playlist;

        try {
            const eventResult = await postData<[], []>(`events/${id}`, eventData);
            setEventData(eventResult.data);
            console.log(result);
        } catch (error) {
            console.error(error);
        } finally {
            console.log('error saving')
        }
    };

    const handleStopStream = async () => {
        eventData.status = "stopped";
        eventData.scenes = playlist;
        try {
            const eventResult = await postData<[], []>(`events/${id}`, eventData);
            setEventData(eventResult.data);

            console.log(result);
        } catch (error) {
            console.error(error);
        } finally {
            console.log('error saving')
        }
    };

    const addItemToPlaylist = async (item) => {
        const updatedPlaylist = [...playlist, item];
        const mock = {
            id: 262,
            location: "example-videos/clip-1.mp4",
            metadata: "{\"id\":\"260\",\"title\":\"test data\"}"
        }
        setPlaylist(updatedPlaylist);
    };

    if (loading) return <p>Loading...</p>;
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
                                    {eventData?.status}
                                </Typography>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    onClick={handleStopStream}
                                    variant="contained"
                                    color="secondary"
                                    style={{ marginRight: '16px' }} // Horizontal spacing between buttons
                                >
                                    End Stream
                                </Button>

                                <Button
                                    onClick={handleGoLive}
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
                            <MediaList data={mediaData} addItemToPlaylist={addItemToPlaylist} />
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
                                <PlayList data={playlist} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Studio;