import { IsNotEmpty, IsString } from 'class-validator';

export class userloginDto {

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

}
