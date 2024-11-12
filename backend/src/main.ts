import hls from 'hls-server';
import httpAttach from 'http-attach';
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

    const corsMiddleWare = (req, res, next) => {
        res.setHeader(`Access-Control-Allow-Origin`, `*`);
        res.setHeader(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
        res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        next();
    }



    new hls(contentServer, hlsServerConfig);

    httpAttach(contentServer, corsMiddleWare)

}

start();
