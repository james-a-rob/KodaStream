import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1725103389863 implements MigrationInterface {
    name = 'Migration1725103389863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scene" ("id" SERIAL NOT NULL, "location" text NOT NULL, "metadata" text NOT NULL DEFAULT '', "eventId" integer, CONSTRAINT "PK_680b182e0d3bd68553f944295f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "status" text NOT NULL, "url" text NOT NULL, "loop" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "log" ("id" SERIAL NOT NULL, "datetime" text NOT NULL, "sessionId" text NOT NULL, "name" text, "url" text, "type" text NOT NULL, "eventId" integer, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scene" ADD CONSTRAINT "FK_dce25c825e17d9563ee62cbecdb" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_5f9eb41fe85adc6fb8b51ba6c4f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_5f9eb41fe85adc6fb8b51ba6c4f"`);
        await queryRunner.query(`ALTER TABLE "scene" DROP CONSTRAINT "FK_dce25c825e17d9563ee62cbecdb"`);
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TABLE "scene"`);
    }

}
