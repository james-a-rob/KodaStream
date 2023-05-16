var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { createLiveEvent, getLiveEvent } from './db';
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.json());
app.post("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = createLiveEvent(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.send(event);
}));
app.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = getLiveEvent(req.params.id);
    res.setHeader('Content-Type', 'application/json');
    res.send(event);
}));
export default app;
