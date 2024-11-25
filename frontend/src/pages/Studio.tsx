import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Button, Link, Tooltip, Container, IconButton, TextField, ToggleButton, ToggleButtonGroup, } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useParams } from 'react-router-dom';
import { OpenInNew } from '@mui/icons-material';
import MediaList from '../components/MediaList';
import PlayList from '../components/PlayList';
import { fetchData, putData } from '../services/api';
import Preview from '../components/Video';


type ApiDataResponse = {
    data: Record<string, unknown>
}

type ApiRequest = Record<string, unknown>

const Studio: React.FC = () => {
    const [eventData, setEventData] = useState<Record<string, unknown> | null>(null);
    const [unchangedEventData, setUnchangedEventData] = useState<Record<string, unknown> | null>(null);

    const [mediaData, setMediaData] = useState<Record<string, unknown> | null>(null);
    const [analyticsData, setAnalyticsData] = useState<Record<string, unknown> | null>(null);
    const [playlist, setPlaylist] = useState<Record<string, unknown> | []>([]);
    const [unchangedPlaylist, setUnchangedPlaylist] = useState<Record<string, unknown> | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    const { id } = useParams<{ id: string }>();
    const previewLink = `preview/${id}`;


    useEffect(() => {
        const getData = async () => {
            try {
                const eventResult = await fetchData<ApiDataResponse>(`events/${id}`);
                const mediaResult = await fetchData<ApiDataResponse>(`media`);
                const analyticsResult = await fetchData<ApiDataResponse>(`events/${id}/analytics`);
                if (eventResult && mediaResult && analyticsResult && eventResult.data.scenes) {
                    setEventData(eventResult.data);
                    setUnchangedEventData(eventResult.data)
                    setMediaData(mediaResult.data);
                    setAnalyticsData(analyticsResult.data);
                    setPlaylist(eventResult.data.scenes);
                    setUnchangedPlaylist(eventResult.data.scenes)
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [id]);


    const handleGoLive = async () => {
        if (eventData) {
            eventData.status = "started";
            eventData.scenes = playlist;
            eventData.scenes = playlist.map(({ metadata, location }) => ({ metadata, location }));

            try {
                const eventResult = await putData<ApiRequest, ApiDataResponse>(`events/${id}`, eventData);
                setEventData(eventResult.data);
                setUnchangedEventData(eventResult.data);


            } catch (error) {
                console.error(error);
            }
        }

    };

    const handleStopStream = async () => {
        if (eventData && eventData) {
            eventData.status = "stopped";
            eventData.scenes = playlist;
            eventData.scenes = playlist.map(({ metadata, location }) => ({ metadata, location }));

            try {
                const eventResult = await putData<ApiRequest, ApiDataResponse>(`events/${id}`, eventData);
                setEventData(eventResult.data);
                setUnchangedEventData(eventResult.data);
                unchangedPlaylist(eventResult.data.scenes)
            } catch (error) {
                console.error(error);
            }
        }

    };

    const addItemToPlaylist = async (item) => {
        item.metadata = JSON.stringify({ "test": "data" });
        const updatedPlaylist = [...playlist, item];
        setPlaylist(updatedPlaylist);
    };

    const deleteItemFromPlaylists = (id: number) => {
        setPlaylist((prevRows) => prevRows.filter((row) => row.id !== id));

    }

    const clearPlaylist = () => {
        setPlaylist([])
    }

    const handleMetadataChange = (newMetadata: Record, id) => {
        let parsedNewMetadata;
        try {
            parsedNewMetadata = JSON.parse(newMetadata);
        } catch (e) {
            alert("Invalid JSON")
            return;
        }
        const updatedPlaylist = playlist.map(item =>
            item.id === id ? { ...item, metadata: parsedNewMetadata } : item
        );
        setPlaylist(updatedPlaylist)


    };

    const handleModeChange = (e) => {
        const newEventData = {
            ...eventData,
            type: e.target.value
        }
        setEventData(newEventData);
    }

    if (loading) return <p>Loading...</p>;

    return (
        <Container style={{ marginTop: '20px' }}>
            <Typography variant="h3">Studio</Typography>

            <Grid container spacing={2} sx={{ padding: 2 }}>
                {/* Full-width Card */}
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Typography variant="h4" component="div">
                                    Live Stream {eventData?.id}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {eventData?.status}
                                </Typography>
                            </div>


                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ToggleButtonGroup
                                    style={{ marginRight: '16px' }}

                                    value={eventData?.type}
                                    exclusive
                                    onChange={handleModeChange}
                                    color="primary"
                                    size="small"
                                >
                                    <ToggleButton value="Live">Live</ToggleButton>
                                    <ToggleButton value="VOD">VOD</ToggleButton>
                                </ToggleButtonGroup>
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
                                    // disabled={JSON.stringify(eventData) === JSON.stringify(unchangedEventData) && JSON.stringify(playlist) === JSON.stringify(unchangedPlaylist) ? false : true}
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
                    <Card variant="outlined" style={{ height: '200px' }}>
                        <CardContent
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',  // Keep title at the top-left
                                height: '100%',
                            }}
                        >
                            {/* Title aligned to the left at the top */}
                            <Typography variant="h4" component="div" gutterBottom>
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
                    <Card variant="outlined" style={{ height: '200px' }}>
                        <CardContent
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',  // Keep title at the top-left
                                height: '100%',
                            }}
                        >
                            {/* Title aligned to the left at the top */}
                            <Typography variant="h4" component="div" gutterBottom>
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
                                {analyticsData?.averageSessionLength || 0} secs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stream Status */}
                <Grid item xs={4}>
                    <Card variant="outlined" style={{ height: '200px' }}>
                        <div>
                            {eventData?.status === "started" && <Preview id={eventData.id} sessionId="testing-session-id" />}
                        </div>
                    </Card>
                </Grid>

                {/* Two Split Grids */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" component="div">
                                Media
                            </Typography>
                            <MediaList data={mediaData} addItemToPlaylist={addItemToPlaylist} />
                        </CardContent>
                    </Card>
                </Grid>


                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h4" component="div">
                                    Playlist
                                </Typography>
                                <IconButton
                                    aria-label="clear all"
                                    onClick={() => clearPlaylist()} // Clear all items
                                    size="small"
                                    color="error"
                                >
                                    <Tooltip title="Clear All">
                                        <ClearAllIcon />
                                    </Tooltip>
                                </IconButton>
                            </div>
                            <Typography variant="body2">
                                <PlayList data={playlist} deleteItemFromPlaylists={deleteItemFromPlaylists} onMetadataUpdate={handleMetadataChange} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Container>
    );
};

export default Studio;
