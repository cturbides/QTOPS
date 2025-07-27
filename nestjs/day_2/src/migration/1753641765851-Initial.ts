import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1753641765851 implements MigrationInterface {
    name = 'Initial1753641765851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(100) NOT NULL, "price" decimal(10,2) NOT NULL, "stock" integer NOT NULL, "tags" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
