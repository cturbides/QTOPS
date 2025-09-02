import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialEntities1754611271853 implements MigrationInterface {
    name = 'InitialEntities1754611271853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "etiquetas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(50) NOT NULL, CONSTRAINT "UQ_a4b4a8a74f3d0795a06ef1f24b8" UNIQUE ("nombre"), CONSTRAINT "PK_7ebf44885c27deb39c934e5560b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "instructores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, CONSTRAINT "PK_e5ce2eae557a24aab6bc206e31b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "detalles_curso" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objetivos" text NOT NULL, "requisitos" text NOT NULL, "publicoObjetivo" text NOT NULL, CONSTRAINT "PK_12a43fe86bf05d74503ac5f9f2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cursos_completos" ("fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying(200) NOT NULL, "descripcion" text NOT NULL, "detalleId" uuid, "instructorId" uuid, CONSTRAINT "REL_814ca3bdb2ba84133bc949e618" UNIQUE ("detalleId"), CONSTRAINT "PK_8626b4c714a826f525d97108051" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lecciones_completas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying(200) NOT NULL, "contenido" text NOT NULL, "cursoId" uuid, CONSTRAINT "PK_f110d14136ef7b347d3cd3a1586" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "curso_etiquetas" ("cursosCompletosId" uuid NOT NULL, "etiquetasId" uuid NOT NULL, CONSTRAINT "PK_6ad757ba9911c9167ced1e9844d" PRIMARY KEY ("cursosCompletosId", "etiquetasId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e184739b25be3b5fd48f8e03a" ON "curso_etiquetas" ("cursosCompletosId") `);
        await queryRunner.query(`CREATE INDEX "IDX_947fe8919cb436c6e170e0c1b1" ON "curso_etiquetas" ("etiquetasId") `);
        await queryRunner.query(`ALTER TABLE "cursos_completos" ADD CONSTRAINT "FK_814ca3bdb2ba84133bc949e618d" FOREIGN KEY ("detalleId") REFERENCES "detalles_curso"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cursos_completos" ADD CONSTRAINT "FK_e9e1c54df4d8f8b6570985021dc" FOREIGN KEY ("instructorId") REFERENCES "instructores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lecciones_completas" ADD CONSTRAINT "FK_9df7e238428c60404aea8523e63" FOREIGN KEY ("cursoId") REFERENCES "cursos_completos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "curso_etiquetas" ADD CONSTRAINT "FK_8e184739b25be3b5fd48f8e03a8" FOREIGN KEY ("cursosCompletosId") REFERENCES "cursos_completos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "curso_etiquetas" ADD CONSTRAINT "FK_947fe8919cb436c6e170e0c1b1e" FOREIGN KEY ("etiquetasId") REFERENCES "etiquetas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "query-result-cache"`);
        await queryRunner.query(`ALTER TABLE "curso_etiquetas" DROP CONSTRAINT "FK_947fe8919cb436c6e170e0c1b1e"`);
        await queryRunner.query(`ALTER TABLE "curso_etiquetas" DROP CONSTRAINT "FK_8e184739b25be3b5fd48f8e03a8"`);
        await queryRunner.query(`ALTER TABLE "lecciones_completas" DROP CONSTRAINT "FK_9df7e238428c60404aea8523e63"`);
        await queryRunner.query(`ALTER TABLE "cursos_completos" DROP CONSTRAINT "FK_e9e1c54df4d8f8b6570985021dc"`);
        await queryRunner.query(`ALTER TABLE "cursos_completos" DROP CONSTRAINT "FK_814ca3bdb2ba84133bc949e618d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_947fe8919cb436c6e170e0c1b1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e184739b25be3b5fd48f8e03a"`);
        await queryRunner.query(`DROP TABLE "curso_etiquetas"`);
        await queryRunner.query(`DROP TABLE "lecciones_completas"`);
        await queryRunner.query(`DROP TABLE "cursos_completos"`);
        await queryRunner.query(`DROP TABLE "detalles_curso"`);
        await queryRunner.query(`DROP TABLE "instructores"`);
        await queryRunner.query(`DROP TABLE "etiquetas"`);
    }

}
