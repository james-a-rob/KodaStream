
import React from 'react';
// import Overlay from './overlay'
import KodaPlayer from '../koda-player/koda-player';


export default function Video({ id }) {
    const VIDEO_ID = id
    const videoRef = React.useRef(null);
    const [currentClipsMetaData, setCurrentClipsMetaData] = React.useState(null)

    React.useEffect(() => {
        //setup koda player

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
                console.log('metadatachange')

            }
        });
    }, [])

    const playVideo = () => {
        videoRef.current.play();
    };

    const pauseVideo = () => {
        videoRef.current.pause();
    };


    return (
        <div className="video-container" >
            {/* <Overlay currentClipsMetaData={currentClipsMetaData} /> */}
            {/* <video className="video" src="https://www.w3schools.com/html/mov_bbb.mp4" controls/> */}
            < video className="video" ref={videoRef} width="100%" controls />


        </div>

    );
}
