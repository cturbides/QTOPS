import { Field, InputType } from '@nestjs/graphql';
import { AuditSeverity } from '@modules/curso/entities/audit/audit-severity.enum';
import { AuditEventType } from '@modules/curso/entities/audit/audit-event-type.enum';

@InputType()
export class AuditLogFilter {
    @Field({ nullable: true })
    userId?: string;

    @Field(() => AuditEventType, { nullable: true })
    eventType?: AuditEventType;

    @Field(() => AuditSeverity, { nullable: true })
    severity?: AuditSeverity;

    @Field({ nullable: true })
    startDate?: Date;

    @Field({ nullable: true })
    endDate?: Date;

    @Field({ nullable: true })
    success?: boolean;
}
