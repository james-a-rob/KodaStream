"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiveEvent = exports.createLiveEvent = void 0;
require("reflect-metadata");
var events = [];
var createLiveEvent = function (liveEvent) {
    var newLiveEvent = __assign({ id: '1234' }, liveEvent);
    events.push(newLiveEvent);
    return newLiveEvent;
};
exports.createLiveEvent = createLiveEvent;
var getLiveEvent = function (id) {
    var event = events.find(function (event) { return event.id === id; });
    if (event) {
        return event;
    }
    else {
        return null;
    }
};
exports.getLiveEvent = getLiveEvent;
//# sourceMappingURL=db.js.map