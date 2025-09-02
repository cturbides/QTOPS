import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEventStoreTable1693843200000 implements MigrationInterface {
    name = 'CreateEventStoreTable1693843200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'event_store',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()'
                    },
                    {
                        name: 'event_id',
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'aggregate_id',
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'event_type',
                        type: 'varchar',
                        isNullable: false
                    },
                    {
                        name: 'event_data',
                        type: 'jsonb',
                        isNullable: false
                    },
                    {
                        name: 'version',
                        type: 'int',
                        isNullable: false
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false
                    }
                ],
                indices: [
                    {
                        name: 'IDX_event_store_aggregate_version',
                        columnNames: ['aggregate_id', 'version'],
                        isUnique: true
                    },
                    {
                        name: 'IDX_event_store_aggregate',
                        columnNames: ['aggregate_id']
                    },
                    {
                        name: 'IDX_event_store_event_type',
                        columnNames: ['event_type']
                    },
                    {
                        name: 'IDX_event_store_timestamp',
                        columnNames: ['timestamp']
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('event_store');
    }
}
