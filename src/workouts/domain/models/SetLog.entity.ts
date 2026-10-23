import { InvalidWorkoutException } from "../errors/InvalidWorkoutException.js";

export interface SetLogProps {
    id: string;
    exerciseId: string;
    reps: number;
    // Kilogramos; 0 para ejercicios con peso corporal
    weight: number;
    createdAt: Date;
}

export class SetLog {
    private static readonly MAX_REPS = 1000;
    private static readonly MAX_WEIGHT = 1000;

    constructor(private readonly props: SetLogProps) {}

    static create(props: SetLogProps): SetLog {
        if (!Number.isInteger(props.reps) || props.reps < 1 || props.reps > SetLog.MAX_REPS) {
            throw new InvalidWorkoutException(`Reps must be an integer between 1 and ${SetLog.MAX_REPS}.`);
        }
        if (!Number.isFinite(props.weight) || props.weight < 0 || props.weight > SetLog.MAX_WEIGHT) {
            throw new InvalidWorkoutException(`Weight must be between 0 and ${SetLog.MAX_WEIGHT} kg.`);
        }
        return new SetLog({ ...props, weight: Math.round(props.weight * 100) / 100 });
    }

    get Id(): string {
        return this.props.id;
    }

    getExerciseId(): string {
        return this.props.exerciseId;
    }

    getReps(): number {
        return this.props.reps;
    }

    getWeight(): number {
        return this.props.weight;
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }
}
