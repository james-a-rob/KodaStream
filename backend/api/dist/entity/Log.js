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
import { LogType } from "../enums";
let Log = class Log {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Log.prototype, "id", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Log.prototype, "datetime", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Log.prototype, "sessionId", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Log.prototype, "name", void 0);
__decorate([
    Column('text', { nullable: true }),
    __metadata("design:type", String)
], Log.prototype, "url", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], Log.prototype, "type", void 0);
__decorate([
    ManyToOne('Event', 'logs'),
    __metadata("design:type", Object)
], Log.prototype, "event", void 0);
Log = __decorate([
    Entity()
], Log);
export { Log };
//# sourceMappingURL=Log.js.map