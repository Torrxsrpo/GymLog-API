import { Exercise } from "../../domain/models/Exercise.entity.js";
import { MuscleGroup } from "../../domain/models/MuscleGroup.entity.js";
import { ExerciseOrmEntity } from "./ExerciseOrm.entity.js";
import { MuscleGroupOrmEntity } from "./MuscleGroupOrm.entity.js";

export class exerciseMapper {
  static toDomain(orm: ExerciseOrmEntity): Exercise {
    return new Exercise({
      id: orm.id,
      name: orm.name,
      img: orm.img,
      muscleGroupId: orm.muscleGroupId,
    });
  }

  static toOrm(domain: Exercise): ExerciseOrmEntity {
    const orm = new ExerciseOrmEntity();
    orm.id = domain.Id;
    orm.name = domain.getName();
    orm.img = domain.getImg();
    orm.muscleGroupId = domain.getMuscleGroupId();
    return orm;
  }
}

export class muscleGroupMapper {
  static toDomain(orm: MuscleGroupOrmEntity): MuscleGroup {
    return new MuscleGroup({ id: orm.id, name: orm.name });
  }

  static toOrm(domain: MuscleGroup): MuscleGroupOrmEntity {
    const orm = new MuscleGroupOrmEntity();
    orm.id = domain.Id;
    orm.name = domain.getName();
    return orm;
  }
}
