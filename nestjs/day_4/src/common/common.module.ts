import { UsersModule } from '@users/users.module';
import { Module, Logger, forwardRef } from '@nestjs/common';
import { AuditService } from '@common/services/audit.service';

@Module({
    imports: [forwardRef(() => UsersModule)],
    exports: [AuditService, Logger],
    providers: [AuditService, Logger],
})
export class CommonModule { }
