import { Request } from 'express';
import { hlsServerConfig } from "../src/content-server";

describe('content server config', () => {
    test('it adds metadata to m3u8 file', () => {
        const fakeRequest = {
            url: '/events/1/output.m3u8'
        } as Request;
        const cb = () => {

        }
        console.log(hlsServerConfig.provider.getManifestStream(fakeRequest, cb));
    });
});