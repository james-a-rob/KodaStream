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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLiveEvent = exports.getLiveEvent = exports.createLiveEvent = void 0;
require("reflect-metadata");
var data_source_1 = __importDefault(require("./data-source"));
var Event_1 = require("./entity/Event");
var Scene_1 = require("./entity/Scene");
var createLiveEvent = function (liveEvent) { return __awaiter(void 0, void 0, void 0, function () {
    var eventRepository, scenes, event;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventRepository = data_source_1.default.getRepository(Event_1.Event);
                scenes = liveEvent.scenes.map(function (scene) {
                    var currentScene = new Scene_1.Scene();
                    currentScene.location = scene.location;
                    currentScene.metadata = scene.metadata;
                    return currentScene;
                });
                event = new Event_1.Event();
                event.url = liveEvent.url;
                event.loop = liveEvent.loop;
                event.status = liveEvent.status;
                event.scenes = scenes;
                return [4 /*yield*/, eventRepository.save(event)];
            case 1:
                _a.sent();
                return [2 /*return*/, event];
        }
    });
}); };
exports.createLiveEvent = createLiveEvent;
var getLiveEvent = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var eventRepository, event;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventRepository = data_source_1.default.getRepository(Event_1.Event);
                return [4 /*yield*/, eventRepository.findOne({
                        where: {
                            id: parseInt(id)
                        },
                        relations: {
                            scenes: true
                        },
                    })];
            case 1:
                event = _a.sent();
                return [2 /*return*/, event];
        }
    });
}); };
exports.getLiveEvent = getLiveEvent;
var updateLiveEvent = function (id, liveEvent) { return __awaiter(void 0, void 0, void 0, function () {
    var eventRepository, event, updatedScenes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventRepository = data_source_1.default.getRepository(Event_1.Event);
                return [4 /*yield*/, eventRepository.findOne({
                        where: {
                            id: parseInt(id)
                        },
                        relations: {
                            scenes: true
                        },
                    })];
            case 1:
                event = _a.sent();
                updatedScenes = __spreadArray(__spreadArray([], event.scenes, true), liveEvent.scenes, true);
                event.scenes = updatedScenes;
                return [4 /*yield*/, eventRepository.save(event)];
            case 2:
                _a.sent();
                return [2 /*return*/, event];
        }
    });
}); };
exports.updateLiveEvent = updateLiveEvent;
//# sourceMappingURL=db.js.map