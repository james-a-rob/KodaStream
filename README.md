## Basic Usage

``` js
const livePlayer = new LivePlayer('live-event-id');

livePlayer.on('change-video', (videoMetaData) => {
    console.log(videoMetaData.title);
});
```