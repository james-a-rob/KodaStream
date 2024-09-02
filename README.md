<div align="center">

## KodaStream

### 📺 Interactive Video for Websites, Apps, and Smart TVs ✨

Open-source tool for creating immersive and interactive video experiences.

<a href="https://sneakinpeace.com"><img src="sneak.gif" width="100%"></a>

</div>

## 👤 Use Cases
- Shoppable videos
- Online TV channels
- Interactive video tours
- Gamified experiences

## 🔥 Features
- Time-based metadata: Synchronize video moments with rich user experiences.
- Multi-format: Support for on-demand, live, and simulated live content.
- Cross-platform: Generate interactive video content for the web, desktop, native, and smart TVs.
- Chromeless video player: Bring your own styles.
- REST API: Automate workflows in your preferred programming language.
- Self-hosted: Fully own the deployment.
- Web-based video creation UI (Coming Soon!)

## 🚀 Quick Start
1. Ensure Docker is installed on your machine.
2. Clone this repo.
3. Create a `videos` directory inside the `backend` folder. Add any videos you want to use here. Two example videos can be found in the `example-videos` directory.
4. Run `make up` from the root of the project.
5. Call the REST API to create new interactive content.

### Example Request
This example combines two video clips into a looping live stream. As each clip plays, client-side events containing the metadata are triggered. This metadata is used to build out interactivity, such as clickable links and buy buttons.

**POST** `http://localhost:4000/events`

```json
{
    "loop": true,
    "type": "live",
    "scenes": [
        {
            "location": "videos/clip-1.mp4",
            "metadata": {
                "text": "This is some overlaying text"
            }
        },
        {
            "location": "videos/clip-2.mp4",
            "metadata": {
                "button-text": "Click me for more info",
                "url": "https://google.com"
            }
        }
    ]
}
```

### View the Video
Navigate to the simple sample app in frontend/demos to see the clickable video. Take a look at the KodaPlayer class and its onMetadataChange event to understand more about how client-side interactivity is added.



## 👩‍🏫 Tutorial
Learn how to create an interactive TV channel with our [getting started tutorial](docs/getting-started.md).
