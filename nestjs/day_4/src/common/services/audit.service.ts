import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
    private readonly logger = new Logger('Audit');

    async logAction(entry: Record<string, any>): Promise<void> {
        this.logger.log(JSON.stringify(entry));
    }
}
