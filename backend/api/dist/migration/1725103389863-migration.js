var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Migration1725103389863 {
    constructor() {
        this.name = 'Migration1725103389863';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "scene" ("id" SERIAL NOT NULL, "location" text NOT NULL, "metadata" text NOT NULL DEFAULT '', "eventId" integer, CONSTRAINT "PK_680b182e0d3bd68553f944295f4" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "status" text NOT NULL, "url" text NOT NULL, "loop" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`CREATE TABLE "log" ("id" SERIAL NOT NULL, "datetime" text NOT NULL, "sessionId" text NOT NULL, "name" text, "url" text, "type" text NOT NULL, "eventId" integer, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
            yield queryRunner.query(`ALTER TABLE "scene" ADD CONSTRAINT "FK_dce25c825e17d9563ee62cbecdb" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_5f9eb41fe85adc6fb8b51ba6c4f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_5f9eb41fe85adc6fb8b51ba6c4f"`);
            yield queryRunner.query(`ALTER TABLE "scene" DROP CONSTRAINT "FK_dce25c825e17d9563ee62cbecdb"`);
            yield queryRunner.query(`DROP TABLE "log"`);
            yield queryRunner.query(`DROP TABLE "event"`);
            yield queryRunner.query(`DROP TABLE "scene"`);
        });
    }
}
//# sourceMappingURL=1725103389863-migration.js.map