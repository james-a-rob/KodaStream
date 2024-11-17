import React, { useEffect, useState, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Button, Link, Tooltip, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { OpenInNew } from '@mui/icons-material';
import MediaList from '../components/MediaList';
import PlayList from '../components/PlayList';
import { fetchData, postData } from '../services/api';
import Preview from '../components/Video';

const Studio: React.FC = () => {
    const [eventData, setEventData] = useState<[]>([]);
    const [mediaData, setMediaData] = useState<[]>([]);
    const [analyticsData, setAnalyticsData] = useState<[]>([]);
    const [playlist, setPlaylist] = useState<[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [videoHeight, setVideoHeight] = useState<number>(0);  // State for storing video height

    const { id } = useParams<{ id: string }>();
    const previewLink = `/preview/${id}`;

    // Ref for video container to measure height
    const videoRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const eventResult = await fetchData<[]>(`events/${id}`);
                const mediaResult = await fetchData<[]>(`media`);
                const analyticsResult = await fetchData<[]>(`events/${id}/analytics`);

                setEventData(eventResult.data);
                setMediaData(mediaResult.data);
                setAnalyticsData(analyticsResult.data);
                setPlaylist(eventResult.data.scenes);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [id]);

    useEffect(() => {
        if (videoRef.current) {
            setVideoHeight(videoRef.current.offsetHeight); // Set height of video component on mount
        }
    }, [eventData]);  // Recalculate on eventData change

    const handleGoLive = async () => {
        eventData.status = "started";
        eventData.scenes = playlist;

        try {
            const eventResult = await postData<[], []>(`events/${id}`, eventData);
            setEventData(eventResult.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStopStream = async () => {
        eventData.status = "stopped";
        eventData.scenes = playlist;
        try {
            const eventResult = await postData<[], []>(`events/${id}`, eventData);
            setEventData(eventResult.data);
        } catch (error) {
            console.error(error);
        }
    };

    const addItemToPlaylist = async (item) => {
        const updatedPlaylist = [...playlist, item];
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
                                    style={{ marginRight: '16px' }}
                                >
                                    End Stream
                                </Button>

                                <Button
                                    onClick={handleGoLive}
                                    variant="contained"
                                    color="primary"
                                    style={{ marginRight: '16px' }}
                                >
                                    Go Live
                                </Button>

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
                    <Card variant="outlined" style={{ height: videoHeight }}>
                        <CardContent
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',  // Keep title at the top-left
                                height: '100%',
                            }}
                        >
                            {/* Title aligned to the left at the top */}
                            <Typography variant="h5" component="div" gutterBottom>
                                Total Viewers
                            </Typography>

                            {/* Value centered in remaining space */}
                            <Typography
                                variant="h2"
                                color="textPrimary"
                                style={{
                                    fontSize: '2rem',  // Large font size for the value
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    flexGrow: 1, // Ensures the value stays centered
                                    marginTop: '30px', // Push the number to the center vertically
                                }}
                            >
                                {analyticsData?.totalViewers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Average Session Length */}
                <Grid item xs={4}>
                    <Card variant="outlined" style={{ height: videoHeight }}>
                        <CardContent
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',  // Keep title at the top-left
                                height: '100%',
                            }}
                        >
                            {/* Title aligned to the left at the top */}
                            <Typography variant="h5" component="div" gutterBottom>
                                Avg Session Length
                            </Typography>

                            {/* Value centered in remaining space */}
                            <Typography
                                variant="h2"
                                color="textPrimary"
                                style={{
                                    fontSize: '2rem',  // Large font size for the value
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    flexGrow: 1, // Ensures the value stays centered
                                    marginTop: '30px', // Push the number to the center vertically
                                }}
                            >
                                {analyticsData?.averageSessionLength} mins
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stream Status */}
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <div ref={videoRef}>
                            <Preview id={eventData.id} />
                        </div>
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
