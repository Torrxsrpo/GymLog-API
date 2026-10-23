import { InvalidRoutineException } from "../errors/InvalidRoutineException.js";

export interface RoutineExerciseProps {
    exerciseId: string;
    targetSets: number;
    targetReps: number;
}

export class RoutineExercise {
    private static readonly MAX_SETS = 20;
    private static readonly MAX_REPS = 100;

    private constructor(private readonly props: RoutineExerciseProps) {}

    static create(props: RoutineExerciseProps): RoutineExercise {
        RoutineExercise.assertInRange("targetSets", props.targetSets, RoutineExercise.MAX_SETS);
        RoutineExercise.assertInRange("targetReps", props.targetReps, RoutineExercise.MAX_REPS);
        return new RoutineExercise({ ...props });
    }

    private static assertInRange(field: string, value: number, max: number): void {
        if (!Number.isInteger(value) || value < 1 || value > max) {
            throw new InvalidRoutineException(`${field} must be an integer between 1 and ${max}.`);
        }
    }

    getExerciseId(): string {
        return this.props.exerciseId;
    }

    getTargetSets(): number {
        return this.props.targetSets;
    }

    getTargetReps(): number {
        return this.props.targetReps;
    }
}
