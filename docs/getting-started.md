# Getting started
Lets learn AirVideo by creating our own online TV Channel.

## Install
Clone this repo and then run ```npm install``` from inside the ./core directory.

## Getting started
```npm run start:dev```

You now have two servers running locally on your machine.

1. **The Air API** on port 4000. This is a REST API that manages creation and updating of events. Use this API to start your live streams. The events endpoint can be called at http://localhost:4000/events. 
2. **The Air Content Server** on port 3000. This server is used to distribute the live stream to viewers. It uses the HLS protocol. A simple demo page that streams event with id 1 is available at  http://localhost:3000


## Starting an event
All you need to start a live stream is one or more pieces of video content (added to the ./video directory). With the app running you can call the ```http://localhost:4000/events``` enpoint with a POST request.

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

The above payload starts a stream composed of 2 videos that will be streamed one after the other. The stream has loop set to true so the event will continutally loop back to playing video 1 as soon as video 2 has finished played.  Both scenes have a string of metadata attached to them that can be accessed on the client side. Metadata is used to show time specific information to a viewer e.g. details about a specifc product that appears in the live stream.

A successful create request returns a JSON response in the following structure. The stream can now be viewed at ```http://localhost:3000```. This is a simple HTML demo app that defaults to playing ```http://localhost:3000/events/1/output.m3u8```. This page is useful for testing purposes.

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

## Updating scenes of a current playing event
Whilst an event is live it is possible to update the scenes of that event. Scene updates are graceful. Changes will take effect once the current scene has finished playing to viewers.

Scene updates can be specified by calling the ```http://localhost:4000/events/:id``` PUT enpoint and specifing an array of new scenes. The request JSON will looking something like this.

```json
{
    "scenes": [
        {

            "location": "videos/video-three.mp4",
            "metadata": "info about video three"
        },
        {
            "location": "videos/video-four.mp4",
            "metadata": "info about video four"
        }
    ]
}

```

The previous scenes array will be entirely replaced with the new scenes passed to the PUT endpoint. The viewer will see the current scene they are viewing play in its entirety. The next scene the viewer sees will be the first scene (videos/video-three.mp4) of the above scenes array.


## Stopping an event
To stop an event, call the ```http://localhost:4000/events/:id``` PUT endpoint setting the status property to be "finsihed"

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
Air is in the early stages so feedback and suggestions are extreamly welcome. Feel free to open an issue or submit a pull request.

## Deploying

