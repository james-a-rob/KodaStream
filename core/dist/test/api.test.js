"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var supertest_1 = __importDefault(require("supertest"));
var data_source_1 = __importDefault(require("../src/data-source"));
var Event_1 = require("../src/entity/Event");
var Scene_1 = require("../src/entity/Scene");
var enums_1 = require("../src/enums");
var api_1 = __importDefault(require("../src/api"));
jest.mock('../src/video-processor', function () { return ({
    start: function () { }
}); });
var simpleEvent = {
    url: 'https://streamer.com/output-1234.m3u8',
    status: enums_1.StreamStatus.Started,
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4'
        }
    ]
};
var eventWithTwoScenesAndMetadata = {
    url: 'https://streamer.com/output-1234.m3u8',
    status: enums_1.StreamStatus.Started,
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4',
            metadata: 'Nike'
        },
        {
            location: 'https://s3.com/videos/5678.mp4',
            metadata: 'Asics'
        }
    ]
};
var addAdditionalScene = {
    scenes: [
        {
            location: 'https://s3.com/videos/5678.mp4'
        }
    ]
};
var simpleLoopedEvent = {
    url: 'https://streamer.com/output-1234.m3u8',
    loop: true,
    status: enums_1.StreamStatus.Started,
    scenes: [
        {
            location: 'https://s3.com/videos/1234.mp4'
        }
    ]
};
beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, data_source_1.default.initialize()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, data_source_1.default.destroy()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
describe("live streaming", function () {
    describe('create', function () {
        test("can create a simple live event that starts imediatly", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                            .post('/event')
                            .send(simpleEvent)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')];
                    case 1:
                        response = _a.sent();
                        expect(response.headers["content-type"]).toMatch(/json/);
                        expect(response.status).toEqual(200);
                        expect(response.body.url).toEqual('https://streamer.com/output-1234.m3u8');
                        expect(response.body.scenes).toEqual([
                            {
                                id: 1,
                                location: 'https://s3.com/videos/1234.mp4',
                                metadata: ''
                            }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("create stream with loop enabled", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                            .post('/event')
                            .send(simpleLoopedEvent)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')];
                    case 1:
                        response = _a.sent();
                        expect(response.headers["content-type"]).toMatch(/json/);
                        expect(response.status).toEqual(200);
                        expect(response.body.url).toEqual('https://streamer.com/output-1234.m3u8');
                        expect(response.body.loop).toBe(true);
                        expect(response.body.scenes).toEqual([
                            {
                                id: 1,
                                location: 'https://s3.com/videos/1234.mp4',
                                metadata: ''
                            }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('create a stream with multiple scenes with their own metadata', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                            .post('/event')
                            .send(eventWithTwoScenesAndMetadata)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')];
                    case 1:
                        response = _a.sent();
                        expect(response.headers["content-type"]).toMatch(/json/);
                        expect(response.body.scenes).toEqual([
                            {
                                id: 1,
                                location: 'https://s3.com/videos/1234.mp4',
                                metadata: 'Nike'
                            },
                            {
                                id: 2,
                                location: 'https://s3.com/videos/5678.mp4',
                                metadata: 'Asics'
                            }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test("create handle no data sent", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                            .post('/event')
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')];
                    case 1:
                        response = _a.sent();
                        expect(response.headers["content-type"]).toMatch(/json/);
                        expect(response.status).toEqual(400);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('update', function () {
        test("add additional scene to already streaming event", function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, response2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                            .post('/event')
                            .send(simpleEvent)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                                .put('/event/1')
                                .send(addAdditionalScene)
                                .set('Content-Type', 'application/json')
                                .set('Accept', 'application/json')];
                    case 2:
                        response2 = _a.sent();
                        expect(response.body.scenes).toEqual([
                            {
                                id: 1,
                                location: 'https://s3.com/videos/1234.mp4',
                                metadata: ''
                            }
                        ]);
                        expect(response2.body.scenes).toEqual([
                            {
                                id: 1,
                                location: 'https://s3.com/videos/1234.mp4',
                                metadata: ''
                            },
                            {
                                id: 2,
                                location: 'https://s3.com/videos/5678.mp4',
                                metadata: ''
                            }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('get', function () {
        test("can retreive an already created live stream", function () { return __awaiter(void 0, void 0, void 0, function () {
            var eventRepository, sceneOne, event, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventRepository = data_source_1.default.getRepository(Event_1.Event);
                        sceneOne = new Scene_1.Scene();
                        sceneOne.location = "https://s3.com/videos/1234.mp4";
                        event = new Event_1.Event();
                        event.url = 'https://streamer.com/output-1234.m3u8';
                        event.status = enums_1.StreamStatus.Started;
                        event.scenes = [sceneOne];
                        return [4 /*yield*/, eventRepository.save(event)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, supertest_1.default)(api_1.default)
                                .get('/event/1')
                                .set('Content-Type', 'application/json')
                                .set('Accept', 'application/json')];
                    case 2:
                        response = _a.sent();
                        expect(response.headers["content-type"]).toMatch(/json/);
                        expect(response.status).toEqual(200);
                        expect(response.body.url).toEqual('https://streamer.com/output-1234.m3u8');
                        expect(response.body.scenes).toEqual([
                            {
                                id: 1,
                                location: 'https://s3.com/videos/1234.mp4',
                                metadata: ''
                            }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=api.test.js.map