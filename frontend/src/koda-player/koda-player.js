// import * as Hls from './hls';
import './parser';

export default class KodaPlayer {

    constructor(options) {
        this.options = options;
        this.videoElement = options.videoElement;
        this.videoSource = options.videoSource;

        this.apiUrl = options.apiUrl;
        this.eventId = options.eventId;
        this.contentServerUrl = options.contentServerUrl;
        this.sessionId = options.sessionId;


        if (options.sessionId) {
            this.setupSendViewerEvent(options.sessionId)

        }
        if (options.onViewerCountChang) {
            this.setupOnViewerCountChange(options.onViewerCountChange)

        }

        if (Hls.isSupported()) {
            this.setupWithHlsLib();
        } else {
            this.setupWithoutHlsLib();
        }
        // this.setupWithoutHlsLib();
        var switchAwayTime;
        var switchBackTime;

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                switchAwayTime = Date.now();
                console.log('currentTime away', this.videoElement.currentTime)

                console.log("Browser tab is hidden")
            } else {
                switchBackTime = Date.now();
                const timeToJump = switchBackTime - switchAwayTime;
                console.log('timeToJump', timeToJump);
                console.log("Browser tab is visible")
                console.log('currentTime back', this.videoElement.currentTime)
                if (this.videoElement.muted) {
                    console.log('jump')
                    this.videoElement.currentTime = this.videoElement.currentTime + timeToJump;
                } else {
                    console.log('no jump')
                }

            }
        });

    }


    setupWithHlsLib() {
        const hls = new Hls({
            capLevelToPlayerSize: true, // Limit max buffer size to player size
            maxMaxBufferLength: 30,   // Maximum number of seconds to keep in the buffer
            maxBufferLength: 30,      // Set max buffer length in seconds
            maxBufferSize: 60 * 1000 * 1000, // Max buffer size in bytes
            lowBufferWatchdogPeriod: 3, // Time in seconds to check for low buffer
            highBufferWatchdogPeriod: 5, // Time in seconds to check for high buffer
            debug: true,              // Enable debug to log buffer-related events
            renderTextTracksNatively: false,
            xhrSetup: function (xhr, url) {
                xhr.setRequestHeader('Access-Control-Allow-Headers', '*')
            }
        });

        // Log detailed HLS.js events
        Object.keys(Hls.Events).forEach((eventName) => {
            hls.on(Hls.Events[eventName], (event, data) => {
                console.log(`[Hls.js Event] ${eventName}:`, data);
            });
        });

        hls.loadSource(this.contentServerUrl + this.videoSource);
        hls.attachMedia(this.videoElement);

        hls.on(Hls.Events.FRAG_CHANGED, (data, frag) => {
            const tag = this.getMetadataTagFromTagList(frag.frag.tagList);
            if (!tag) {
                return;
            }
            const metadata = this.getMetadataFromTag(tag);
            this.options.onMetadataUpdate(metadata);

        });
        hls.on(Hls.Events.FRAG_LOADED, (data, data2) => {
            // console.log('hls3', data, data2);
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.videoElement.play();
        });
    }

    setupWithoutHlsLib() {
        this.videoElement.src = this.videoSource;
        this.videoElement.addEventListener('loadedmetadata', () => {

            this.videoElement.play();
        });
        this.videoElement.textTracks.addEventListener("change", (event) => {
            console.log(`'${event.type}' event fired`);
        });


        // cancel when nav away?
        setInterval(async () => {
            const averageBufferTime = 10;
            //refactor into fetch function
            console.log("video", this.videoElement.currentTime)
            const m3u8Response = await fetch(this.videoSource)
            const m3u8FileContent = await m3u8Response.text();
            var parser = new m3u8Parser.Parser();

            parser.push(m3u8FileContent);
            const manifest = parser.manifest;
            if (manifest.dateRanges.length < 1) {
                return
            }
            if (parser.manifest.mediaSequence > 1 && manifest.dateRanges > 4) {
                const currentlyPlayingSegment = this.videoElement.currentTime
                const metadata = manifest.dateRanges[manifest.dateRanges.length - 3]

                this.options.onMetadataUpdate(metadata.xCustomKey);

            } else {
                const metadata = manifest.dateRanges[manifest.dateRanges.length - 1]
                this.options.onMetadataUpdate(metadata.xCustomKey);


            }

        }, 2000);
    }


    getMetadataTagFromTagList(tagList) {
        const metadataTag = tagList.filter((tag) => {
            if (tag[0] === "EXT-X-DATERANGE") {
                return tag;
            }
        });
        if (metadataTag.length > 0) {
            return metadataTag[0];
        }
    }

    getMetadataFromTag(tag) {
        return tag[1].split(",")[4].split("=")[1].split('"')[1];
    }

    decodeJson(payload) {
        const decodedPayload = JSON.parse(decodeURIComponent(payload));
        return decodedPayload;
    }

    // equivilant online tools for non devs https://www.freeformatter.com/json-escape.html or https://jsontostring.com/
    encodeJson(payload) {
        const encodedPayload = encodeURIComponent(JSON.stringify(payload));
        console.log(encodedPayload);
        return encodedPayload;
    }

    async logEvent(type, name, url) {

        const response = await fetch(this.apiUrl + "/events/" + this.eventId + "/log",
            {
                method: "POST",
                body: JSON.stringify({ sessionId: this.sessionId, type, name, url }),
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    "Content-Type": "application/json",
                },
            },

        );
        const sendViewResp = await response.json();
    }

    setupSendViewerEvent(sessionId) {
        // push viewer event
        const sendViewerEvent = async () => {
            // fetch
            // check no cross origin issues

            const response = await fetch(this.apiUrl + "/events/" + this.eventId + "/log",
                {
                    method: "POST",
                    body: JSON.stringify({ sessionId, type: 'view' }),
                    headers: {
                        'Access-Control-Allow-Headers': '*',
                        "Content-Type": "application/json",
                    },
                },

            );
            const sendViewResp = await response.json();

            //on view change
            console.log(sendViewResp);

            setTimeout(sendViewerEvent, 5000);
            // ...
        }

        // initial call, or just call refresh directly
        sendViewerEvent();

    }

    setupOnViewerCountChange(onViewerCountChange) {
        var currentViewerCount = 0;
        const getViewerCount = async () => {
            // fetch
            // check no cross origin issues
            const response = await fetch(this.apiUrl + "/events/" + this.eventId + "/views");
            const views = await response.json();

            //on view change
            console.log(views);
            onViewerCountChange(views)
            //on change callback

            setTimeout(getViewerCount, 5000);
            // ...
        }

        // initial call, or just call refresh directly
        setTimeout(getViewerCount, 1000);


    }


}
