### Air is currently in alpha. Not recommended for production use.

## Description

Air is a headless live streaming solution with a focus on pre-recorded content and interactivity. 

Take existing video content and repurpose as engaging live streams.

## Features
 - Developer first, start live streams with a single API request.
 - Scalable, content delivered via the HLS protocol. 
 - Interactivity, sync data with video and build out rich end-user experiences.

## Terminology
 - Event - A live stream that is made up of one of more scenes.
 - Scene - Prerecored video content (mp4) or a live broadcast (rtmp).
 - Viewers - End-user consuming the stream via a web browser, native app or other device.

## Video walkthrough
The easiest way to get setup and creating live streams is to follow this video walkthrough.

## Install
Clone this repo and then run ```npm install``` from inside the core directory.


## Getting started
```npm run start:dev```


## Starting an event
All you need to start a live stream is one or more peices of video content (added to the video directory). With the app running you can call the /events enpoint with a POST request.

Example JSON body request to start a stream. 

```json
{
    "loop":true,
    "scenes": [
        {
            "location": "videos/video-one.mp4",
            "metadata": "info about video one"
        },
        {
            "location": "videos/video-two.mp4",
            "metadata": "info about video two"
        }
    ]
}

```

The above payload starts a stream composed of 2 videos that will play one after the other. The stream has loop turned on so will continutally loop back to playing video 1 as soon as video 2 has been played. Both scenes have a string of metadata attached to them that can be accessed on the client side. Metadata is used to show time specific information to a viewer.

A succesful create request return a JSON response in the following structure.

```json
{
    "id": 1,
    "url": "/events/1/output.m3u8",
    "status": "started",
    "loop":true,
    "scenes": [
        {

            "id": 1,
            "location": "videos/video-one.mp4",
            "metadata": "info about video one"
        },
        {
            "id": 2,
            "location": "videos/video-two.mp4",
            "metadata": "info about video two"
        }
    ]
}

```

## Updating an event
Whilst an event is live it is possible to update the scenes of that event. Changes will take effect once the current scene has finished playing to viewers.


## Stopping an event
To stop an event, call the /events/:id PUT setting the status property to be "finsihed"

Example JSON body request to stop a stream.

```json
{
    "status": "finished"
}

```

## Restarting an event

You can always restart an event by calling the PUT endpoint again and specifying the event status as "started".

```json
{
    "status": "started"
}

```


## Contributing 

