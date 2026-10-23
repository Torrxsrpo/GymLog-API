import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { SessionStatus } from '../../../domain/models/enums/SessionStatus.enum.js';

export class StartWorkoutSessionDto {

  @IsOptional()
  @IsUUID()
  routineId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  time?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

}

export class UpdateWorkoutSessionDto {

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  notes?: string;

}

// Los rangos de repeticiones y peso los valida el dominio
export class AddSetLogDto {

  @IsUUID()
  exerciseId!: string;

  @IsInt()
  reps!: number;

  @IsNumber()
  weight!: number;

}
