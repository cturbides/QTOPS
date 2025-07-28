import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@users/entities/user.entity';
import { LoginUserDto } from '@users/dto/login-user.dto';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UsersService } from '@users/services/users.service';
import { UserResponseDto } from '@users/dto/user-response.dto';
import { UpdateProfileDto } from '@users/dto/update-profile.dto';
import { ProfileService } from '@users/services/profile.service';
import { LoginUserResponseDto } from '@users/dto/login-user.response.dto';
import { Controller, Get, Post, Body, Param, Patch, UsePipes, ValidationPipe, UnauthorizedException, Logger } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
  ) { }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() dto: LoginUserDto): Promise<LoginUserResponseDto> {
    this.logger.log('Logging in user with data:', { ...dto, password: '***' });

    if (!dto.email || !dto.password) {
      throw new Error('Email and password are required');
    }

    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, roles: user.roles };
    const token = this.jwtService.sign(payload);

    return { accessToken: token };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log('Creating user with data:', { ...createUserDto, password: '***' });

    const user: User = await this.usersService.create(createUserDto);

    return this.usersService.toResponseDto(user);
  }

  @Get(':email')
  async findOne(@Param('email') email: string): Promise<UserResponseDto> {
    this.logger.log('Finding user with email:', email);

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
    this.logger.log('Updating profile for user with email:', email, 'with data:', { ...dto, password: dto.password ? '***' : undefined });

    const updatedUser: User = await this.profileService.updateProfile(email, dto);

    return this.usersService.toResponseDto(updatedUser);
  }
}