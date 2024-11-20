import React from 'react';
import KodaPlayer from '../koda-player/koda-player';

const generateGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};

const sessionGuid = generateGUID();

export default function Video({ id, sessionId }) {
    const VIDEO_ID = id;
    const videoRef = React.useRef(null);
    const [currentClipsMetaData, setCurrentClipsMetaData] = React.useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const CONTENT_BASE_URL = import.meta.env.VITE_CONTENT_BASE_URL;

    React.useEffect(() => {
        // Setup Koda player
        const player = new KodaPlayer({
            videoElement: videoRef.current,
            videoSource: `/events/${VIDEO_ID}/output.m3u8`,
            eventId: VIDEO_ID,
            apiUrl: API_BASE_URL,
            contentServerUrl: CONTENT_BASE_URL,
            sessionId: sessionId || sessionGuid,
            onMetadataUpdate: (data) => {
                const decodedJson = player.decodeJson(data);
                setCurrentClipsMetaData(decodedJson);
                console.log('metadatachange');
            }
        });
    }, [VIDEO_ID]);

    const playVideo = () => {
        videoRef.current.play();
    };

    const pauseVideo = () => {
        videoRef.current.pause();
    };

    return (
        <div className="video-container" style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%" // 16:9 aspect ratio (9/16 = 0.5625)
        }}>
            {/* The wrapper's height is based on the width, maintaining a 16:9 ratio */}
            <video
                autoPlay
                muted
                ref={videoRef}
                className="video"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // Ensures the video covers the entire container without distortion
                }}
                controls
            />
        </div>
    );
}
