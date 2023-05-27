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
exports.Event = void 0;
var typeorm_1 = require("typeorm");
var Scene_1 = require("./Scene");
var enums_1 = require("../enums");
var Event = /** @class */ (function () {
    function Event() {
    }
    __decorate([
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], Event.prototype, "id", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], Event.prototype, "status", void 0);
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], Event.prototype, "url", void 0);
    __decorate([
        (0, typeorm_1.Column)({ type: 'boolean', default: false }),
        __metadata("design:type", Boolean)
    ], Event.prototype, "loop", void 0);
    __decorate([
        (0, typeorm_1.OneToMany)(function () { return Scene_1.Scene; }, function (scene) { return scene.event; }, { cascade: true }),
        __metadata("design:type", Array)
    ], Event.prototype, "scenes", void 0);
    Event = __decorate([
        (0, typeorm_1.Entity)()
    ], Event);
    return Event;
}());
exports.Event = Event;
//# sourceMappingURL=Event.js.map