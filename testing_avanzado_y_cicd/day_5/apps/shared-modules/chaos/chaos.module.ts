import { Module } from '@nestjs/common';
import { ChaosService } from './chaos.service';
import { ChaosController } from './chaos.controller';

@Module({
  providers: [ChaosService],
  controllers: [ChaosController],
  exports: [ChaosService],
})
export class ChaosModule {}
