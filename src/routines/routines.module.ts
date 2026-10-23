import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '../exercises/exercises.module.js';
import { CreateRoutineUseCase } from './application/use-cases/create-Routine.CaseUse.js';
import { GetRoutinesUseCase } from './application/use-cases/get-Routines.CaseUse.js';
import { GetRoutineUseCase } from './application/use-cases/get-Routine.CaseUse.js';
import { UpdateRoutineUseCase } from './application/use-cases/update-Routine.CaseUse.js';
import { DeleteRoutineUseCase } from './application/use-cases/delete-Routine.CaseUse.js';
import { ROUTINE_REPOSITORY } from './domain/ports/RoutineRepository.port.js';
import { RoutineOrmEntity } from './infrastructure/persistence/RoutineOrm.entity.js';
import { RoutineExerciseOrmEntity } from './infrastructure/persistence/RoutineExerciseOrm.entity.js';
import { RoutineRepositoryAdapter } from './infrastructure/persistence/Routine.repository.js';
import { RoutinesController } from './infrastructure/http/controllers/Routines.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineOrmEntity, RoutineExerciseOrmEntity]), ExercisesModule],
  controllers: [RoutinesController],
  providers: [
    //cases uses
    CreateRoutineUseCase,
    GetRoutinesUseCase,
    GetRoutineUseCase,
    UpdateRoutineUseCase,
    DeleteRoutineUseCase,

    { provide: ROUTINE_REPOSITORY, useClass: RoutineRepositoryAdapter },
  ],
  // Las sesiones de entrenamiento comprueban que la rutina sea del usuario
  exports: [ROUTINE_REPOSITORY],
})
export class RoutinesModule {}
