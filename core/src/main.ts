import hls from 'hls-server';
import apiApp from './api';
import AppDataSource from './data-source';
import { app as contentApp, hlsServerConfig } from './content-server';

const start = async () => {
    await AppDataSource.initialize();

    apiApp.listen(4000, () => {
        console.log('api listening on port 4000');
    });

    const contentServer = contentApp.listen(3000, () => {
        console.log('content server listening on port 3000');
    });

    new hls(contentServer, hlsServerConfig)
}

start();
