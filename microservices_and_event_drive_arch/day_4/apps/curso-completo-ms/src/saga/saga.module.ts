import { Module } from '@nestjs/common';
import { EnrollmentSagaModule } from './enrollment/enrollment-saga.module';

@Module({
  imports: [
    EnrollmentSagaModule
  ],
  exports: [
    EnrollmentSagaModule
  ]
})
export class SagaModule {}
