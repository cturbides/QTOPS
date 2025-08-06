import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCursoOnlineEntity1754444051372 implements MigrationInterface {
    name = 'CreateCursoOnlineEntity1754444051372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cursos_online_niveldificultad_enum" AS ENUM('avanzado', 'intermedio', 'principiante')`);
        await queryRunner.query(`CREATE TABLE "cursos_online" ("fechaCreacion" TIMESTAMP NOT NULL DEFAULT now(), "fechaActualizacion" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying(200) NOT NULL, "descripcion" text NOT NULL, "nivelDificultad" "public"."cursos_online_niveldificultad_enum" NOT NULL DEFAULT 'principiante', "precio" numeric(8,2) NOT NULL, "duracionHoras" integer NOT NULL DEFAULT '0', "activo" boolean NOT NULL DEFAULT true, "tags" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_063aeb484f8e521605103c2d572" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cursos_online"`);
        await queryRunner.query(`DROP TYPE "public"."cursos_online_niveldificultad_enum"`);
    }

}
