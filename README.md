### Air is currently in alpha. Not recommended for production use.

## Description

Air is a headless live streaming solution with a focus on pre-recorded content and interactivity. 

Take existing video content and repurpose as engaging live streams.

## Features
 - Developer first, start live streams with a single API request.
 - Scalable, content delivered via the HLS protocol. 
 - Interactivity, sync data with video and build out rich end-user experiences.

## Install
You will need node.js and npm installed on your machine.
Git clone this repo.
cd into core
npm install

## Terminology
Event - A live stream that is made up of one of more scenes.
Scene - Prerecored video content (mp4) or a live broadcast (rtmp).
Viewers - End-user consuming the stream via a web browser of native app.


## Getting started
Run app. npm run start:dev
Add video content. 
Make post request with infinite loop and meta data. 
Upate stream.
Stop stream.

### Starting an event

### Updating an event
Whilst an event is live it is possible to update the scenes of that event. Changes will take effect once the current scene has finished playing to viewers.



### Stopping a stream
To stop an event, call the /events/:id PUT setting the status property to be "finsihed"

Example JSON body request to stop a stream.

```
{
    "status": "finished"
}

```

You can always restart an event by calling the PUT endpoint again and specifying and specifying the event status as "started".

```
{
    "status": "started"
}

```


## Contributing 

