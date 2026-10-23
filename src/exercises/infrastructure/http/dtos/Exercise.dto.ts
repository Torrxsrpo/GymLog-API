import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateExerciseDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsUrl()
  img?: string;

  @IsString()
  @IsNotEmpty()
  muscleGroupId!: string;

}

export class GetExercisesQueryDto {

  @IsOptional()
  @IsString()
  muscleGroupId?: string;

}

export class CreateMuscleGroupDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

}
