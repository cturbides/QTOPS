import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderItemEntity1753667055950 implements MigrationInterface {
    name = 'AddOrderItemEntity1753667055950';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "order_item" (
        "id" varchar PRIMARY KEY NOT NULL,
        "quantity" integer NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "orderId" varchar,
        "productId" varchar,
        CONSTRAINT "FK_order_item_order" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_order_item_product" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "order_item"`);
    }
}
