import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '../exercises/exercises.module.js';
import { RoutinesModule } from '../routines/routines.module.js';
import { StartWorkoutSessionUseCase } from './application/use-cases/start-WorkoutSession.CaseUse.js';
import { GetWorkoutSessionsUseCase } from './application/use-cases/get-WorkoutSessions.CaseUse.js';
import { GetWorkoutSessionUseCase } from './application/use-cases/get-WorkoutSession.CaseUse.js';
import { UpdateWorkoutSessionUseCase } from './application/use-cases/update-WorkoutSession.CaseUse.js';
import { DeleteWorkoutSessionUseCase } from './application/use-cases/delete-WorkoutSession.CaseUse.js';
import { AddSetLogUseCase } from './application/use-cases/add-SetLog.CaseUse.js';
import { DeleteSetLogUseCase } from './application/use-cases/delete-SetLog.CaseUse.js';
import { OwnedWorkoutSessionService } from './application/services/OwnedWorkoutSession.service.js';
import { WORKOUT_SESSION_REPOSITORY } from './domain/ports/WorkoutSessionRepository.port.js';
import { WorkoutSessionOrmEntity } from './infrastructure/persistence/WorkoutSessionOrm.entity.js';
import { SetLogOrmEntity } from './infrastructure/persistence/SetLogOrm.entity.js';
import { WorkoutSessionRepositoryAdapter } from './infrastructure/persistence/WorkoutSession.repository.js';
import { WorkoutSessionsController } from './infrastructure/http/controllers/WorkoutSessions.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutSessionOrmEntity, SetLogOrmEntity]), ExercisesModule, RoutinesModule],
  controllers: [WorkoutSessionsController],
  providers: [
    //cases uses
    StartWorkoutSessionUseCase,
    GetWorkoutSessionsUseCase,
    GetWorkoutSessionUseCase,
    UpdateWorkoutSessionUseCase,
    DeleteWorkoutSessionUseCase,
    AddSetLogUseCase,
    DeleteSetLogUseCase,
    OwnedWorkoutSessionService,

    { provide: WORKOUT_SESSION_REPOSITORY, useClass: WorkoutSessionRepositoryAdapter },
  ],
})
export class WorkoutsModule {}
