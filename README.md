
<div align="center">

## KodaStream



### 📺 Interactive video for websites, apps and smart TVs✨

Open-source tool for creating immersive and interactive video experiences.

<a href="https://sneakinpeace.com"><img src="sneak.gif" width="100%"></a>


</div>


## 👤 Use cases
 - Shoppable videos
 - Online TV channels
 - Interactive video tours
 - Gamified experiences


## 🔥 Features
 - Time based metadata: Synchronize video moments with rich user experiences.
 - Multi-format: support for on-demand, live and simulated live content.
 - Cross platform: generate interactive video content for the web, desktop, native and smart TVs. 
 - Chromeless video player: Bring your own styles.
 - REST API: automate workflows in your preferred programming language.
 - Self hosted: Fully own the deployment.
 - Web-based video creation UI (Coming Soon!)

## 🚀 Quick start
1. Ensure docker is installed on your machine.
2. Clone this repo.
3. Create a videos directoy inside the backend folder. Any any videos you want to use here.
4. Run ```make up``` from root of project.
5. Call the REST API to create a new interactive content.

### Example request
POST http://localhost:4000
Scenes: All the clips and corospoding metadata you want to use in your video. Add any video clip to the videos directory that you want to use. Scenes will be combined together into a final continuous video.
Metadata: Each seen has json meta data attached to it. As each scene plays its metadata becomes avaiable to the client side video player. This time base metadata the the core to building cross platgform interactivty over video content. This interacity can range from simple text overlays purchasing products directly inside a video. There are no schema restirctions on the JSON metadata. 
Type:
Loop:
```json
{
    "loop":true,
    "type":"live",
    "scenes": [
        {
            "location": "videos/test-clip-1.mp4",
            "metadata": {
                "text": "this is some overlaying text"
            }
        },
        {
            "location": "videos/test-clip-2.mp4",
            "metadata": {
                "button-text": "Click me for more info",
                "url": "https://google.com"
            }
        }
    ]
}

```

### View the video
Navigate to sample app to see the clickable video. Take a look at the Koda player class and its on metadatachange event to understand more how client side interactivty is added. 

Theres an example in public
Make use of the KodaPlayer class
Does a few things including cross browser video playback and client side subscriptions to metada changes




## 👩‍🏫 Tutorial
Learn how to create an interactive TV channel with our [getting started tutorial](docs/hacker-news-tv.md).
