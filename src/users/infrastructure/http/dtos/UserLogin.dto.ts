import { IsNumber, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';

export class userloginDto {

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(8)
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

}