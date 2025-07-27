import { User } from '@users/entities/user.entity';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UsersService } from '@users/services/users.service';
import { UserResponseDto } from '@users/dto/user-response.dto';
import { UpdateProfileDto } from '@users/dto/update-profile.dto';
import { ProfileService } from '@users/services/profile.service';
import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
  ) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    console.log('Creating user with data:', { ...createUserDto, password: '***' });

    const user: User = await this.usersService.create(createUserDto);

    return this.usersService.toResponseDto(user);
  }

  @Get(':email')
  async findOne(@Param('email') email: string): Promise<UserResponseDto> {
    console.log('Finding user with email:', email);

    const user: User | null = await this.usersService.findByEmail(email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return this.usersService.toResponseDto(user);
  }

  @Patch(':email')
  async updateProfile(
    @Param('email') email: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    console.log(
      'Updating profile for user with email:', email, 'with data:',
      { ...dto, password: dto.password ? '***' : undefined }
    );

    const updatedUser: User = await this.profileService.updateProfile(email, dto);

    return this.usersService.toResponseDto(updatedUser);
  }
}