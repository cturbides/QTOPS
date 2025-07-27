import { Module } from '@nestjs/common';
import { UsersModule } from '@users/users.module';
import { AuditService } from '@common/services/audit.service';

@Module({
    imports: [UsersModule],
    exports: [AuditService],
    providers: [AuditService],
})
export class CommonModule { }
