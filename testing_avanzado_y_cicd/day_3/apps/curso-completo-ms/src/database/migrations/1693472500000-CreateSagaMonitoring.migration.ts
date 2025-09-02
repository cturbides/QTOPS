import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSagaMonitoring1693472500000 implements MigrationInterface {
  name = 'CreateSagaMonitoring1693472500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'saga_monitoring',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'sagaId',
            type: 'uuid',
          },
          {
            name: 'issueType',
            type: 'enum',
            enum: ['TIMEOUT', 'STUCK', 'INCONSISTENT_STATE', 'COMPENSATION_FAILED']
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DETECTED', 'INVESTIGATING', 'RESOLVED', 'ESCALATED'],
            default: "'DETECTED'"
          },
          {
            name: 'description',
            type: 'text'
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'resolutionNotes',
            type: 'text',
            isNullable: true
          },
          {
            name: 'assignedTo',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'detectedAt',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'resolvedAt',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          }
        ],
        indices: [
          {
            name: 'IDX_saga_monitoring_saga_id',
            columnNames: ['sagaId']
          },
          {
            name: 'IDX_saga_monitoring_issue_type',
            columnNames: ['issueType']
          },
          {
            name: 'IDX_saga_monitoring_status',
            columnNames: ['status']
          },
          {
            name: 'IDX_saga_monitoring_detected_at',
            columnNames: ['detectedAt']
          }
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('saga_monitoring');
  }
}
