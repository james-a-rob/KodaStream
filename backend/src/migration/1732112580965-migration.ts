import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732112580965 implements MigrationInterface {
    name = 'Migration1732112580965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scene" ALTER COLUMN "metadata" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scene" ALTER COLUMN "metadata" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scene" ALTER COLUMN "metadata" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "scene" ALTER COLUMN "metadata" SET NOT NULL`);
    }

}
