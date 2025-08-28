import { MigrationInterface, QueryRunner } from "typeorm";

export class DLUpdatedAuditColumns1755716520683 implements MigrationInterface {
    name = 'DLUpdatedAuditColumns1755716520683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renombrar columnas
        await queryRunner.query(`ALTER TABLE "cursos_completos" RENAME COLUMN "fechaCreacion" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "cursos_completos" RENAME COLUMN "fechaActualizacion" TO "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir nombres de columnas
        await queryRunner.query(`ALTER TABLE "cursos_completos" RENAME COLUMN "created_at" TO "fechaCreacion"`);
        await queryRunner.query(`ALTER TABLE "cursos_completos" RENAME COLUMN "updated_at" TO "fechaActualizacion"`);
    }
}
