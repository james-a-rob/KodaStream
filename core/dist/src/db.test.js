"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("./db");
var enums_1 = require("./enums");
var inputEvent = {
    url: 'https://streamer.com/output-1234.m3u8',
    status: enums_1.StreamStatus.Started,
    scenes: [
        {
            url: 'https://s3.com/videos/1234.mp4'
        }
    ]
};
test('create live event', function () {
    expect((0, db_1.createLiveEvent)(inputEvent)).toEqual({
        id: '1234',
        url: 'https://streamer.com/output-1234.m3u8',
        status: 'started',
        scenes: [
            {
                url: 'https://s3.com/videos/1234.mp4'
            }
        ]
    });
});
test('get live event by id', function () {
    var liveEvent = (0, db_1.createLiveEvent)(inputEvent);
    expect((0, db_1.getLiveEvent)(liveEvent.id)).toEqual({
        id: '1234',
        url: 'https://streamer.com/output-1234.m3u8',
        status: 'started',
        scenes: [
            {
                url: 'https://s3.com/videos/1234.mp4'
            }
        ]
    });
});
//# sourceMappingURL=db.test.js.map