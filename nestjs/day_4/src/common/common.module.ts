import { UsersModule } from '@users/users.module';
import { Module, Logger, forwardRef } from '@nestjs/common';
import { AuditService } from '@common/services/audit.service';

@Module({
    exports: [AuditService, Logger],
    providers: [AuditService, Logger],
    imports: [forwardRef(() => UsersModule)],
})
export class CommonModule { }
