import { MigrationInterface, QueryRunner } from "typeorm";

export class DLAddAuditColumnToAllEntities1755716728959 implements MigrationInterface {
    name = 'DLAddAuditColumnToAllEntities1755716728959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "etiquetas" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "etiquetas" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "etiquetas" ADD "deleted_at" TIMESTAMP`);

        await queryRunner.query(`ALTER TABLE "evaluaciones" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "evaluaciones" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "evaluaciones" ADD "deleted_at" TIMESTAMP`);

        await queryRunner.query(`ALTER TABLE "instructores" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "instructores" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "instructores" ADD "deleted_at" TIMESTAMP`);
        
        await queryRunner.query(`ALTER TABLE "detalles_curso" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "detalles_curso" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "detalles_curso" ADD "deleted_at" TIMESTAMP`);

        await queryRunner.query(`ALTER TABLE "cursos_completos" ADD "deleted_at" TIMESTAMP`);

        await queryRunner.query(`ALTER TABLE "lecciones_completas" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lecciones_completas" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "lecciones_completas" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lecciones_completas" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "lecciones_completas" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "lecciones_completas" DROP COLUMN "created_at"`);

        await queryRunner.query(`ALTER TABLE "cursos_completos" DROP COLUMN "deleted_at"`);

        await queryRunner.query(`ALTER TABLE "detalles_curso" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "detalles_curso" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "detalles_curso" DROP COLUMN "deleted_at"`);

        await queryRunner.query(`ALTER TABLE "instructores" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "instructores" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "instructores" DROP COLUMN "deleted_at"`);

        await queryRunner.query(`ALTER TABLE "evaluaciones" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "evaluaciones" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "evaluaciones" DROP COLUMN "deleted_at"`);

        await queryRunner.query(`ALTER TABLE "etiquetas" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "etiquetas" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "etiquetas" DROP COLUMN "deleted_at"`);
    }
}
