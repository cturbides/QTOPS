import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteQuantityColumnFromOrder1753667749612 implements MigrationInterface {
    name = 'DeleteQuantityColumnFromOrder1753667749612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_order_item" ("id" varchar PRIMARY KEY NOT NULL, "quantity" integer NOT NULL, "price" decimal(10,2) NOT NULL, "orderId" varchar, "productId" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_order_item"("id", "quantity", "price", "orderId", "productId") SELECT "id", "quantity", "price", "orderId", "productId" FROM "order_item"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_item" RENAME TO "order_item"`);
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" varchar PRIMARY KEY NOT NULL, "productId" varchar, "quantity" integer NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "status" text NOT NULL DEFAULT ('PENDING'), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "productId", "quantity", "totalPrice", "createdAt", "userId", "status") SELECT "id", "productId", "quantity", "totalPrice", "createdAt", "userId", "status" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
        await queryRunner.query(`CREATE TABLE "temporary_order" ("id" varchar PRIMARY KEY NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "status" text NOT NULL DEFAULT ('PENDING'), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order"("id", "totalPrice", "createdAt", "userId", "status") SELECT "id", "totalPrice", "createdAt", "userId", "status" FROM "order"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`ALTER TABLE "temporary_order" RENAME TO "order"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_item" ("id" varchar PRIMARY KEY NOT NULL, "quantity" integer NOT NULL, "price" decimal(10,2) NOT NULL, "orderId" varchar, "productId" varchar, CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_item"("id", "quantity", "price", "orderId", "productId") SELECT "id", "quantity", "price", "orderId", "productId" FROM "order_item"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_item" RENAME TO "order_item"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" RENAME TO "temporary_order_item"`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" varchar PRIMARY KEY NOT NULL, "quantity" integer NOT NULL, "price" decimal(10,2) NOT NULL, "orderId" varchar, "productId" varchar)`);
        await queryRunner.query(`INSERT INTO "order_item"("id", "quantity", "price", "orderId", "productId") SELECT "id", "quantity", "price", "orderId", "productId" FROM "temporary_order_item"`);
        await queryRunner.query(`DROP TABLE "temporary_order_item"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" varchar PRIMARY KEY NOT NULL, "productId" varchar, "quantity" integer NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "status" text NOT NULL DEFAULT ('PENDING'), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order"("id", "totalPrice", "createdAt", "userId", "status") SELECT "id", "totalPrice", "createdAt", "userId", "status" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME TO "temporary_order"`);
        await queryRunner.query(`CREATE TABLE "order" ("id" varchar PRIMARY KEY NOT NULL, "productId" varchar, "quantity" integer NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" varchar, "status" text NOT NULL DEFAULT ('PENDING'), CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order"("id", "productId", "quantity", "totalPrice", "createdAt", "userId", "status") SELECT "id", "productId", "quantity", "totalPrice", "createdAt", "userId", "status" FROM "temporary_order"`);
        await queryRunner.query(`DROP TABLE "temporary_order"`);
        await queryRunner.query(`ALTER TABLE "order_item" RENAME TO "temporary_order_item"`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" varchar PRIMARY KEY NOT NULL, "quantity" integer NOT NULL, "price" decimal(10,2) NOT NULL, "orderId" varchar, "productId" varchar, CONSTRAINT "FK_order_item_product" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_order_item_order" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "order_item"("id", "quantity", "price", "orderId", "productId") SELECT "id", "quantity", "price", "orderId", "productId" FROM "temporary_order_item"`);
        await queryRunner.query(`DROP TABLE "temporary_order_item"`);
    }

}
