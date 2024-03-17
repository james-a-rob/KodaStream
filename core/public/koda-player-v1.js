/** Player used to embed live stream on a webpage */
class KodaPlayer {

    constructor(options) {

        this.options = options;
        this.videoElement = options.videoElement;
        this.videoSource = options.videoSource;
        this.apiUrl = options.apiUrl;
        this.eventId = options.eventId;

        this.setupSendViewerEvent(options.sessionId)
        this.setupOnViewerCountChange(options.onViewerCountChange)

        if (Hls.isSupported()) {
            this.setupWithHlsLib();
        } else {
            this.setupWithoutHlsLib();
        }

        // setup on viewer change

        var switchAwayTime;
        var switchBackTime;

        this.totalJumpedAbout = 0;

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
                    this.totalJumpedAbout = this.totalJumpedAbout + timeToJump;
                } else {
                    console.log('no jump')
                }

            }
        });



    }

    setupWithHlsLib() {
        const hls = new Hls({
            renderTextTracksNatively: false,
            xhrSetup: function (xhr, url) {
                xhr.setRequestHeader('Access-Control-Allow-Headers', '*')
            }
        });

        hls.loadSource(this.videoSource);
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
        this.videoElement.addEventListener('loadedmetadata', async (event) => {
            var startingVidTime;
            this.videoElement.play();
            setInterval(async () => {
                const m3u8Response = await fetch(this.videoSource)
                const m3u8FileContent = await m3u8Response.text();

                var parser = new m3u8Parser.Parser();

                parser.push(m3u8FileContent);
                // debugger

                console.log(Math.round(this.videoElement.currentTime * 1000))
                const currentVidTime = Math.round(this.videoElement.currentTime * 1000);
                if (!startingVidTime) {
                    console.log('set starting vid')
                    startingVidTime = Date.parse(parser.manifest.segments[0].dateTimeString)

                }
                console.log(startingVidTime)
                const currentVidSegmentDate = currentVidTime + startingVidTime + this.totalJumpedAbout
                console.log('date of currently playing segment', new Date(currentVidSegmentDate))


                console.log(parser)
                // get closest date

            }, 3000)

        });


        // cancel when nav away?
        setInterval(async () => {
            //refactor into fetch function
            const m3u8Response = await fetch(this.videoSource)
            const m3u8FileContent = await m3u8Response.text();
            var parser = new m3u8Parser.Parser();

            parser.push(m3u8FileContent);
            const manifest = parser.manifest;
            if (manifest.dateRanges.length < 1) {
                return
            }
            if (parser.manifest.mediaSequence > 1) {
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
        return tag[1].split(",")[5].split("=")[1].split('"')[1];
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

    setupSendViewerEvent(sessionId) {
        // push viewer event
        const sendViewerEvent = async () => {
            // fetch
            // check no cross origin issues
            const response = await fetch(this.apiUrl + "/events/" + this.eventId + "/views",
                {
                    method: "POST",
                    body: JSON.stringify({ sessionId }),
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

    setupOnViewerCountChange() {
        var currentViewerCount = 0;
        const getViewerCount = async () => {
            // fetch
            // check no cross origin issues
            const response = await fetch(this.apiUrl + "/events/" + this.eventId + "/views");
            const views = await response.json();

            //on view change
            console.log(views);

            //on change callback

            setTimeout(getViewerCount, 5000);
            // ...
        }

        // initial call, or just call refresh directly
        setTimeout(getViewerCount, 1000);


    }

}