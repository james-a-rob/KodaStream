"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var typeorm_1 = require("typeorm");
var Event_1 = require("./entity/Event");
var Scene_1 = require("./entity/Scene");
var AppDataSource = new typeorm_1.DataSource({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [Event_1.Event, Scene_1.Scene],
    synchronize: true,
    logging: false
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map