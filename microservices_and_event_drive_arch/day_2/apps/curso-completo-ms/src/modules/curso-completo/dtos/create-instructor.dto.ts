import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateInstructorDto {
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  @MaxLength(150)
  email: string;
}
