import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732452250182 implements MigrationInterface {
    name = 'Migration1732452250182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "thumbnail" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "thumbnail"`);
    }

}
