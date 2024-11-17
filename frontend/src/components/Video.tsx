import React from 'react';
// import Overlay from './overlay'
import KodaPlayer from '../koda-player/koda-player';

export default function Video({ id }) {
    const VIDEO_ID = id;
    const videoRef = React.useRef(null);
    const [currentClipsMetaData, setCurrentClipsMetaData] = React.useState(null);

    React.useEffect(() => {
        // Setup Koda player
        const player = new KodaPlayer({
            videoElement: videoRef.current,
            videoSource: `/events/${VIDEO_ID}/output.m3u8`,
            eventId: VIDEO_ID,
            apiUrl: "http://localhost:4000",
            contentServerUrl: "http://localhost:3000",
            sessionId: "1703778468",
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
