import { Routine } from "../../domain/models/Routine.entity.js";
import { RoutineExercise } from "../../domain/models/RoutineExercise.vo.js";
import { RoutineOrmEntity } from "./RoutineOrm.entity.js";
import { RoutineExerciseOrmEntity } from "./RoutineExerciseOrm.entity.js";

export class routineMapper {
  static toDomain(orm: RoutineOrmEntity, exercises: RoutineExerciseOrmEntity[]): Routine {
    return new Routine({
      id: orm.id,
      userId: orm.userId,
      name: orm.name,
      date: orm.date,
      frequency: orm.frequency,
      exercises: [...exercises]
        .sort((a, b) => a.position - b.position)
        .map((exercise) => RoutineExercise.create({
          exerciseId: exercise.exerciseId,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
        })),
    });
  }

  static toOrm(domain: Routine): RoutineOrmEntity {
    const orm = new RoutineOrmEntity();
    orm.id = domain.Id;
    orm.userId = domain.getUserId();
    orm.name = domain.getName();
    orm.date = domain.getDate();
    orm.frequency = domain.getFrequency();
    return orm;
  }

  static toExerciseOrms(domain: Routine): RoutineExerciseOrmEntity[] {
    return domain.getExercises().map((exercise, position) => {
      const orm = new RoutineExerciseOrmEntity();
      orm.routineId = domain.Id;
      orm.exerciseId = exercise.getExerciseId();
      orm.targetSets = exercise.getTargetSets();
      orm.targetReps = exercise.getTargetReps();
      orm.position = position;
      return orm;
    });
  }
}
