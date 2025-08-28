import { MigrationInterface, QueryRunner } from "typeorm";

export class DDLAddActivoPropertyToCursosCompletos1755720399928 implements MigrationInterface {
    name = 'DDLAddActivoPropertyToCursosCompletos1755720399928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cursos_completos" ADD "activo" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cursos_completos" DROP COLUMN "activo"`);
    }

}
