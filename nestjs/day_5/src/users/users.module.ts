import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { CommonModule } from '@common/common.module';
import { UsersService } from '@users/services/users.service';
import { ProfileService } from '@users/services/profile.service';
import { UsersController } from '@users/controllers/users.controller';

@Module({
  controllers: [UsersController],
  exports: [UsersService, ProfileService],
  providers: [UsersService, ProfileService],
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User]), forwardRef(() => CommonModule)],
})
export class UsersModule { }
