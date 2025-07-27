import { PickType } from '@nestjs/mapped-types';
import { User } from '@users/entities/user.entity';

export class UserResponseDto extends PickType(User, [
    'id',
    'name',
    'email',
    'createdAt',
] as const) { }
