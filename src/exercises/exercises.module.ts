import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetExercisesUseCase } from './application/use-cases/get-Exercises.CaseUse.js';
import { GetExerciseUseCase } from './application/use-cases/get-Exercise.CaseUse.js';
import { CreateExerciseUseCase } from './application/use-cases/create-Exercise.CaseUse.js';
import { GetMuscleGroupsUseCase } from './application/use-cases/get-MuscleGroups.CaseUse.js';
import { CreateMuscleGroupUseCase } from './application/use-cases/create-MuscleGroup.CaseUse.js';
import { EXERCISE_REPOSITORY } from './domain/ports/ExerciseRepository.port.js';
import { MUSCLE_GROUP_REPOSITORY } from './domain/ports/MuscleGroupRepository.port.js';
import { ExerciseOrmEntity } from './infrastructure/persistence/ExerciseOrm.entity.js';
import { MuscleGroupOrmEntity } from './infrastructure/persistence/MuscleGroupOrm.entity.js';
import { ExerciseRepositoryAdapter } from './infrastructure/persistence/Exercise.repository.js';
import { MuscleGroupRepositoryAdapter } from './infrastructure/persistence/MuscleGroup.repository.js';
import { ExerciseCatalogService } from './application/services/ExerciseCatalog.service.js';
import { ExerciseSeeder } from './infrastructure/persistence/Exercise.seeder.js';
import { ExercisesController } from './infrastructure/http/controllers/Exercises.controller.js';
import { MuscleGroupsController } from './infrastructure/http/controllers/MuscleGroups.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([MuscleGroupOrmEntity, ExerciseOrmEntity])],
  controllers: [ExercisesController, MuscleGroupsController],
  providers: [
    //cases uses
    GetExercisesUseCase,
    GetExerciseUseCase,
    CreateExerciseUseCase,
    GetMuscleGroupsUseCase,
    CreateMuscleGroupUseCase,

    { provide: EXERCISE_REPOSITORY, useClass: ExerciseRepositoryAdapter },
    { provide: MUSCLE_GROUP_REPOSITORY, useClass: MuscleGroupRepositoryAdapter },
    ExerciseSeeder,
    ExerciseCatalogService,
  ],
  // Rutinas y sesiones validan que los ejercicios existan
  exports: [ExerciseCatalogService],
})
export class ExercisesModule {}
