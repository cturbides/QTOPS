import { User } from '@users/entities/user.entity';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UsersService } from '@users/services/users.service';
import { UserResponseDto } from '@users/dto/user-response.dto';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    console.log('Creating user with data:', { ...createUserDto, password: '***' });

    const user: User = await this.usersService.create(createUserDto);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  }

  @Get(':email')
  async findOne(@Param('email') email: string): Promise<UserResponseDto> {
    console.log('Finding user with email:', email);

    const user: User | null = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}