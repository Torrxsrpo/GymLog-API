import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

// Los rangos (series, repeticiones, frecuencia) los valida el dominio
export class RoutineExerciseDto {

  @IsUUID()
  exerciseId!: string;

  @IsInt()
  targetSets!: number;

  @IsInt()
  targetReps!: number;

}

export class CreateRoutineDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  frequency!: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises!: RoutineExerciseDto[];

}

export class UpdateRoutineDto extends PartialType(CreateRoutineDto) {}
