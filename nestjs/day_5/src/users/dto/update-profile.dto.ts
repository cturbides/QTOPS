import { User } from '@users/entities/user.entity';
import { PartialType, PickType } from '@nestjs/mapped-types';

export class UpdateProfileDto extends PartialType(
    PickType(User, ['name', 'password'] as const)
) { }
