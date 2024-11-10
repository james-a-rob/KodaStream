var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Event } from "./Event";
let Scene = class Scene {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Scene.prototype, "id", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Scene.prototype, "location", void 0);
__decorate([
    Column('text', { default: '' }),
    __metadata("design:type", String)
], Scene.prototype, "metadata", void 0);
__decorate([
    ManyToOne(() => Event, (event) => event.scenes),
    __metadata("design:type", Event)
], Scene.prototype, "event", void 0);
Scene = __decorate([
    Entity()
], Scene);
export { Scene };
//# sourceMappingURL=Scene.js.map