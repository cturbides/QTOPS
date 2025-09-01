import { Module } from '@nestjs/common';
import { EnrollmentSagaModule } from './enrollment/enrollment-saga.module';
import { SagaMonitoringModule } from './monitoring/saga-monitoring.module';

@Module({
  imports: [
    EnrollmentSagaModule,
    SagaMonitoringModule
  ],
  exports: [
    EnrollmentSagaModule,
    SagaMonitoringModule
  ]
})
export class SagaModule {}
