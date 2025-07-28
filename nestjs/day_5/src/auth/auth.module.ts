import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuthGuard } from '@common/decorators/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
        forwardRef(() => UsersModule)
    ],
    providers: [AuthGuard],
    exports: [JwtModule, AuthGuard],
})
export class AuthModule { }

