import { IsString } from 'class-validator';

export class LoginUserResponseDto {
    @IsString()
    accessToken: string;
}
