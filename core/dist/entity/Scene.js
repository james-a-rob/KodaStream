"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
var typeorm_1 = require("typeorm");
var Event_1 = require("./Event");
var Scene = /** @class */ (function () {
    function Scene() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], Scene.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], Scene.prototype, "location", void 0);
    __decorate([
        (0, typeorm_1.Column)({ default: '' }),
        __metadata("design:type", String)
    ], Scene.prototype, "metadata", void 0);
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return Event_1.Event; }, function (event) { return event.scenes; }),
        __metadata("design:type", Event_1.Event)
    ], Scene.prototype, "event", void 0);
    Scene = __decorate([
        (0, typeorm_1.Entity)()
    ], Scene);
    return Scene;
}());
exports.Scene = Scene;
//# sourceMappingURL=Scene.js.map