var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import hls from 'hls-server';
import httpAttach from 'http-attach';
import apiApp from './api';
import AppDataSource from './data-source';
import { app as contentApp, hlsServerConfig } from './content-server';
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('IS STARTING');
    yield AppDataSource.initialize();
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
    };
    new hls(contentServer, hlsServerConfig);
    httpAttach(contentServer, corsMiddleWare);
});
start();
//# sourceMappingURL=main.js.map