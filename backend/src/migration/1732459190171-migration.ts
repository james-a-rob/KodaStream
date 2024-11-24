import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732459190171 implements MigrationInterface {
    name = 'Migration1732459190171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "type" "public"."event_type_enum" NOT NULL DEFAULT 'Live'`);
        await queryRunner.query(`ALTER TABLE "event" ADD "thumbnail" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "thumbnail"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "type"`);
    }

}
