import { WorkoutSession } from "../../domain/models/WorkoutSession.entity.js";
import { SetLog } from "../../domain/models/SetLog.entity.js";
import { WorkoutSessionOrmEntity } from "./WorkoutSessionOrm.entity.js";
import { SetLogOrmEntity } from "./SetLogOrm.entity.js";

export class workoutSessionMapper {
  static toDomain(orm: WorkoutSessionOrmEntity, sets: SetLogOrmEntity[]): WorkoutSession {
    return new WorkoutSession({
      id: orm.id,
      userId: orm.userId,
      routineId: orm.routineId,
      time: orm.time,
      status: orm.status,
      notes: orm.notes,
      sets: [...sets]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((set) => new SetLog({
          id: set.id,
          exerciseId: set.exerciseId,
          reps: set.reps,
          weight: Number(set.weight),
          createdAt: set.createdAt,
        })),
    });
  }

  static toOrm(domain: WorkoutSession): WorkoutSessionOrmEntity {
    const orm = new WorkoutSessionOrmEntity();
    orm.id = domain.Id;
    orm.userId = domain.getUserId();
    orm.routineId = domain.getRoutineId();
    orm.time = domain.getTime();
    orm.status = domain.getStatus();
    orm.notes = domain.getNotes();
    return orm;
  }

  static toSetOrms(domain: WorkoutSession): SetLogOrmEntity[] {
    return domain.getSets().map((set) => {
      const orm = new SetLogOrmEntity();
      orm.id = set.Id;
      orm.workoutSessionId = domain.Id;
      orm.exerciseId = set.getExerciseId();
      orm.reps = set.getReps();
      orm.weight = set.getWeight().toFixed(2);
      orm.createdAt = set.getCreatedAt();
      return orm;
    });
  }
}
