import hls from 'hls-server';
import httpAttach from 'http-attach';
import AppDataSource from '../data-source';
import { app as contentApp, hlsServerConfig } from './content-server';
import FileStorage from '../services/file-storage';

const fileStorage = new FileStorage();


const start = async () => {

    await AppDataSource.initialize();

    const contentServer = contentApp.listen(3000, () => {
        console.log('content server listening on port 3000');
    });

    const corsMiddleWare = (req, res, next) => {
        res.setHeader(`Access-Control-Allow-Origin`, `*`);
        res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        next();
    }

    contentApp.get('/thumbnails/:id/thumbnail.jpg', async (req, res) => {
        const { id } = req.params; // The event ID
        const filePath = `${id}/thumbnail.jpg`; // Assuming the thumbnail path is like this

        // Get the thumbnail image from S3 and serve it
        try {
            // Get the image from S3
            const fileContentBuffer = await fileStorage.getFileByPath('kodastream-thumbnails', filePath);

            // Set the appropriate content type for the image, here assuming it's a JPEG
            res.setHeader('Content-Type', 'image/jpeg');

            // Stream the file content to the response
            res.status(200).send(fileContentBuffer);
        } catch (err) {
            // Handle errors, possibly send a 404 if the file isn't found
            console.log(err);
            res.status(500).send('Error fetching thumbnail');
        }
    });



    new hls(contentServer, hlsServerConfig);

    httpAttach(contentServer, corsMiddleWare)

}

start();