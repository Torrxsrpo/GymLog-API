import { IsEmail, IsString, MinLength } from 'class-validator';

export class userloginDto {

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()

  email!: string;

  @IsString()

  password!: string;

}