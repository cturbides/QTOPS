import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEvaluacionEntitiy1754614204052 implements MigrationInterface {
    name = 'AddEvaluacionEntitiy.migration1754614204052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "evaluaciones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "puntuacion" integer NOT NULL, "comentario" text, "cursoId" uuid, CONSTRAINT "PK_3b157bcce651495e675cdf96a14" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "evaluaciones" ADD CONSTRAINT "FK_b2cd50e4830736927591758f8e7" FOREIGN KEY ("cursoId") REFERENCES "cursos_completos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "evaluaciones" DROP CONSTRAINT "FK_b2cd50e4830736927591758f8e7"`);
        await queryRunner.query(`DROP TABLE "evaluaciones"`);
    }

}
