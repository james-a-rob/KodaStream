import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

import { Typography, Container, Button, Grid } from '@mui/material';
import { fetchData, postData } from '../services/api';

import StreamList from '../components/StreamList';

type ApiDataResponse = {
    data: Record<string, unknown>
}

type ApiRequest = Record<string, unknown>

const StudioList: React.FC = () => {
    const [streamsData, setStreamData] = useState<Record<string, unknown> | null>(null);
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        const getData = async () => {
            try {
                const streamsResult = await fetchData<ApiDataResponse>(`events/`);
                if (streamsResult) {
                    setStreamData(streamsResult.data);

                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);



    const handleCreateEvent = async () => {
        const newStream = {
            "loop": true,
            "status": "stopped",
            "scenes": [


            ]
        }
        try {
            const createdStream = await postData<ApiRequest, ApiDataResponse>(`events`, newStream);
            console.log(createdStream);
            const streamsResult = await fetchData<ApiDataResponse>(`events/`);
            if (streamsResult) {
                setStreamData(streamsResult.data);

            }
        } catch (error) {
            console.error(error);
        }
    }

    const navigateToStream = (id: string) => {

        console.log("Row clicked with ID:", id);
        // Navigate to the /studio/:id route
        navigate(`/studio/${id}`);


    }


    return (
        <Container style={{ marginTop: '20px' }}>
            {/* Grid container to align "Streams" to the left and "Create Stream" button to the right */}
            <Grid container direction="row" alignItems="center" style={{ marginBottom: '20px' }}>
                <Grid item>
                    <Typography variant="h3">
                        Streams
                    </Typography>
                </Grid>

                {/* Button aligned to the right */}
                <Grid item xs style={{ textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateEvent}
                    >
                        Create Stream
                    </Button>
                </Grid>
            </Grid>

            {/* Event List Component */}
            <StreamList data={streamsData} handleRowClick={navigateToStream} />
        </Container>
    );
};

export default StudioList;
