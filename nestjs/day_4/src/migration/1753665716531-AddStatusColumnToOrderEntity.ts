import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusColumnToOrderEntity1753665716531 implements MigrationInterface {
    name = 'AddStatusColumnToOrderEntity1753665716531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" varchar PRIMARY KEY NOT NULL, "productId" varchar, "quantity" integer NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "status" text NOT NULL DEFAULT ('PENDING'), CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "productId", "quantity", "totalPrice", "createdAt", "userId") SELECT "id", "productId", "quantity", "totalPrice", "createdAt", "userId" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" varchar PRIMARY KEY NOT NULL, "productId" varchar, "quantity" integer NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order"("id", "productId", "quantity", "totalPrice", "createdAt", "userId") SELECT "id", "productId", "quantity", "totalPrice", "createdAt", "userId" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
    }

}
