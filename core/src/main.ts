import hls from 'hls-server';
import apiApp from './api';
import { app as contentApp, hlsServerConfig } from './content-server';

const start = async () => {
    apiApp.listen(4000);

    const contentServer = contentApp.listen(3000);
    new hls(contentServer, hlsServerConfig)
}

start();
