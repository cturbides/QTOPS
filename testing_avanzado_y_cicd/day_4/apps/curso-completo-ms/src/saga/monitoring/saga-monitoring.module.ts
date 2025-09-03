import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SagaMonitoringService } from './saga-monitoring.service';
import { SagaMonitoringController } from './saga-monitoring.controller';
import { SagaMonitoring } from './entities/saga-monitoring.entity';
import { EnrollmentSagaState } from '../enrollment/entities/enrollment-saga-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SagaMonitoring, EnrollmentSagaState]),
    ScheduleModule.forRoot()
  ],
  controllers: [SagaMonitoringController],
  providers: [SagaMonitoringService],
  exports: [SagaMonitoringService]
})
export class SagaMonitoringModule {}
