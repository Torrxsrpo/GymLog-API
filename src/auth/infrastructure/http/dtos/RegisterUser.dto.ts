import { IsString, MinLength } from 'class-validator';

export class RegisterUserDto {

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  password!: string;

}
