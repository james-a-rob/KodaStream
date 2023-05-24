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
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var content_server_1 = require("../src/content-server");
var data_source_1 = __importDefault(require("../src/data-source"));
var db_1 = require("../src/db");
var enums_1 = require("../src/enums");
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
var eventWithScenesAndMetadata = {
    url: 'https://streamer.com/output-1234.m3u8',
    loop: true,
    status: enums_1.StreamStatus.Started,
    scenes: [
        {
            location: 'videos/final_sebastien_stylist_intro.mp4',
            metadata: 'Nike',
        }
    ]
};
describe('content server config', function () {
    test('it adds metadata to m3u8 file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var event, locationOfMockVideoContent, locationOfVideoContent, fakeRequest, cb;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_1.createLiveEvent)(eventWithScenesAndMetadata)];
                case 1:
                    event = _a.sent();
                    locationOfMockVideoContent = path_1.default.join(__dirname, "./mock-video-content/short");
                    locationOfVideoContent = path_1.default.join(__dirname, "../src/events/".concat(event.id));
                    return [4 /*yield*/, fs_extra_1.default.remove(locationOfVideoContent)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.ensureDir(locationOfVideoContent)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1.default.copy(locationOfMockVideoContent, locationOfVideoContent)];
                case 4:
                    _a.sent();
                    fakeRequest = {
                        url: '/events/1/output-initial.m3u8'
                    };
                    cb = function (error, stream) {
                        // check arguments
                        var outputPath = path_1.default.join(__dirname, "../src/events/".concat(event.id, "/output.m3u8"));
                        expect(error).toBe(null);
                        expect(stream.path).toBe(outputPath);
                    };
                    return [4 /*yield*/, content_server_1.hlsServerConfig.provider.getManifestStream(fakeRequest, cb)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=content-server.test.js.map