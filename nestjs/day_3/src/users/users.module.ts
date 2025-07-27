import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { UsersService } from '@users/services/users.service';
import { ProfileService } from '@users/services/profile.service';
import { UsersController } from '@users/controllers/users.controller';

@Module({
  controllers: [UsersController],
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  exports: [UsersService, ProfileService],
  providers: [UsersService, ProfileService],
})
export class UsersModule { }
