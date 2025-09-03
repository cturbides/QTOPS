import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEnrollmentSagaState1693472400000 implements MigrationInterface {
    name = 'CreateEnrollmentSagaState1693472400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "enrollment_saga_step_enum" AS ENUM(
                'STARTED', 
                'VALIDATING_USER', 
                'VALIDATING_COURSE', 
                'VALIDATING_PREREQUISITES', 
                'RESERVING_SLOT', 
                'PROCESSING_PAYMENT', 
                'CONFIRMING_ENROLLMENT', 
                'SENDING_NOTIFICATIONS', 
                'COMPLETED', 
                'FAILED', 
                'COMPENSATING'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "payment_method_enum" AS ENUM(
                'CREDIT_CARD', 
                'DEBIT_CARD', 
                'PAYPAL', 
                'BANK_TRANSFER', 
                'CRYPTOCURRENCY'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "enrollment_type_enum" AS ENUM(
                'REGULAR', 
                'PREMIUM', 
                'TRIAL', 
                'SCHOLARSHIP'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "enrollment_saga_state" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sagaId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "courseId" uuid NOT NULL,
                "currentStep" "enrollment_saga_step_enum" NOT NULL DEFAULT 'STARTED',
                "enrollmentType" "enrollment_type_enum" NOT NULL DEFAULT 'REGULAR',
                "requiresPayment" boolean NOT NULL DEFAULT true,
                "paymentMethod" "payment_method_enum",
                "paymentId" character varying,
                "enrollmentId" character varying,
                "reservationId" character varying,
                "amount" numeric(10,2),
                "currency" character varying(3) NOT NULL DEFAULT 'USD',
                "userDetails" jsonb,
                "courseDetails" jsonb,
                "completedSteps" jsonb NOT NULL DEFAULT '[]',
                "compensations" jsonb NOT NULL DEFAULT '[]',
                "executedCompensations" jsonb NOT NULL DEFAULT '[]',
                "userValidated" boolean NOT NULL DEFAULT false,
                "courseValidated" boolean NOT NULL DEFAULT false,
                "prerequisitesMet" boolean NOT NULL DEFAULT false,
                "slotReserved" boolean NOT NULL DEFAULT false,
                "paymentProcessed" boolean NOT NULL DEFAULT false,
                "enrollmentConfirmed" boolean NOT NULL DEFAULT false,
                "notificationsSent" boolean NOT NULL DEFAULT false,
                "completed" boolean NOT NULL DEFAULT false,
                "failed" boolean NOT NULL DEFAULT false,
                "failureReason" character varying,
                "metadata" jsonb,
                "startedAt" TIMESTAMP,
                "completedAt" TIMESTAMP,
                "failedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_enrollment_saga_state_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_sagaId" ON "enrollment_saga_state" ("sagaId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_userId" ON "enrollment_saga_state" ("userId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_courseId" ON "enrollment_saga_state" ("courseId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_currentStep" ON "enrollment_saga_state" ("currentStep")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_completed" ON "enrollment_saga_state" ("completed")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_failed" ON "enrollment_saga_state" ("failed")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_createdAt" ON "enrollment_saga_state" ("createdAt")
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_enrollment_saga_state_sagaId_unique" ON "enrollment_saga_state" ("sagaId")
        `);

        // Create partial indexes for active sagas
        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_active" ON "enrollment_saga_state" ("id") 
            WHERE "completed" = false AND "failed" = false
        `);

        // Create composite indexes for common queries
        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_user_status" ON "enrollment_saga_state" ("userId", "completed", "failed", "createdAt")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_enrollment_saga_state_course_status" ON "enrollment_saga_state" ("courseId", "completed", "failed", "createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_course_status"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_user_status"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_active"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_sagaId_unique"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_failed"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_completed"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_currentStep"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_courseId"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_enrollment_saga_state_sagaId"`);
        await queryRunner.query(`DROP TABLE "enrollment_saga_state"`);
        await queryRunner.query(`DROP TYPE "enrollment_type_enum"`);
        await queryRunner.query(`DROP TYPE "payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "enrollment_saga_step_enum"`);
    }
}
