import { MigrationInterface, QueryRunner } from "typeorm";

export class DDLAddIndexToCursosCompletosEntitiy1755720424497 implements MigrationInterface {
    public readonly transaction: boolean = false;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_cursos_busqueda_texto;`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_cursos_activos_fecha;`);

        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY idx_cursos_busqueda_texto ON cursos_completos USING gin(to_tsvector('spanish', titulo || ' ' || descripcion));
        `);

        await queryRunner.query(`
            CREATE INDEX CONCURRENTLY idx_cursos_activos_fecha ON cursos_completos(created_at DESC) WHERE activo = true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_cursos_busqueda_texto;`);
        await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_cursos_activos_fecha;`);
    }

}
