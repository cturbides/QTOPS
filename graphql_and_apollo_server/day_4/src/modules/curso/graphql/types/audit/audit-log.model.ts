import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AuditSeverity } from '@modules/curso/entities/audit/audit-severity.enum';
import { AuditEventType } from '@modules/curso/entities/audit/audit-event-type.enum';

registerEnumType(AuditEventType, { name: 'AuditEventType' });
registerEnumType(AuditSeverity, { name: 'AuditSeverity' });

@ObjectType()
export class AuditLog {
    @Field()
    id: string;

    @Field()
    timestamp: Date;

    @Field(() => AuditEventType)
    eventType: AuditEventType;

    @Field(() => AuditSeverity)
    severity: AuditSeverity;

    @Field({ nullable: true })
    userId?: string;

    @Field({ nullable: true })
    userEmail?: string;

    @Field(() => [String], { nullable: true })
    userRoles?: string[];

    @Field()
    ip: string;

    @Field({ nullable: true })
    operationName?: string;

    @Field({ nullable: true })
    operationType?: string;

    @Field()
    success: boolean;

    @Field({ nullable: true })
    errorMessage?: string;

    @Field({ nullable: true })
    resourceType?: string;

    @Field({ nullable: true })
    resourceId?: string;
}