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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var db_1 = require("../src/db");
var data_source_1 = __importDefault(require("../src/data-source"));
var video_processor_1 = require("../src/video-processor");
var enums_1 = require("../src/enums");
function waitForFileExists(filePath, currentTime, timeout) {
    if (currentTime === void 0) { currentTime = 0; }
    if (timeout === void 0) { timeout = 5000; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (fs_1.default.existsSync(filePath))
                        return [2 /*return*/, true];
                    if (currentTime === timeout)
                        return [2 /*return*/, false];
                    // wait for 1 second
                    return [4 /*yield*/, new Promise(function (resolve, reject) { return setTimeout(function () { return resolve(true); }, 1000); })];
                case 1:
                    // wait for 1 second
                    _a.sent();
                    // waited for 1 second
                    return [2 /*return*/, waitForFileExists(filePath, currentTime + 1000, timeout)];
            }
        });
    });
}
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
describe('video processor', function () {
    test("starts", function () { return __awaiter(void 0, void 0, void 0, function () {
        var event, eventsLocation, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_1.createLiveEvent)(eventWithScenesAndMetadata)];
                case 1:
                    event = _a.sent();
                    eventsLocation = path_1.default.join(__dirname, "../src/events/".concat(event.id));
                    fs_1.default.rmSync(eventsLocation, { recursive: true, force: true });
                    (0, video_processor_1.start)(1);
                    return [4 /*yield*/, waitForFileExists("".concat(eventsLocation, "/output-initial.m3u8"))];
                case 2:
                    exists = _a.sent();
                    expect(exists).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); }, 10000);
});
//# sourceMappingURL=video-processor.test.js.map