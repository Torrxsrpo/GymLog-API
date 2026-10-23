import { InvalidRoutineException } from "../errors/InvalidRoutineException.js";
import { RoutineExercise } from "./RoutineExercise.vo.js";

export interface RoutineProps {
    id: string;
    userId: string;
    name: string;
    date: Date;
    // Días de entrenamiento por semana
    frequency: number;
    exercises: RoutineExercise[];
}

export interface RoutineChanges {
    name?: string;
    frequency?: number;
    exercises?: RoutineExercise[];
}

export class Routine {
    private static readonly MAX_NAME_LENGTH = 100;
    private static readonly MAX_FREQUENCY = 7;

    constructor(private props: RoutineProps) {}

    static create(props: RoutineProps): Routine {
        return new Routine({
            ...props,
            name: Routine.validateName(props.name),
            frequency: Routine.validateFrequency(props.frequency),
            exercises: Routine.validateExercises(props.exercises),
        });
    }

    update(changes: RoutineChanges): void {
        if (changes.name !== undefined) {
            this.props.name = Routine.validateName(changes.name);
        }
        if (changes.frequency !== undefined) {
            this.props.frequency = Routine.validateFrequency(changes.frequency);
        }
        if (changes.exercises !== undefined) {
            this.props.exercises = Routine.validateExercises(changes.exercises);
        }
    }

    isOwnedBy(userId: string): boolean {
        return this.props.userId === userId;
    }

    private static validateName(name: string): string {
        const trimmed = name?.trim() ?? "";
        if (trimmed.length === 0) {
            throw new InvalidRoutineException("Routine name is required.");
        }
        if (trimmed.length > Routine.MAX_NAME_LENGTH) {
            throw new InvalidRoutineException(`Routine name must be at most ${Routine.MAX_NAME_LENGTH} characters long.`);
        }
        return trimmed;
    }

    private static validateFrequency(frequency: number): number {
        if (!Number.isInteger(frequency) || frequency < 1 || frequency > Routine.MAX_FREQUENCY) {
            throw new InvalidRoutineException(`Frequency must be an integer between 1 and ${Routine.MAX_FREQUENCY} days per week.`);
        }
        return frequency;
    }

    private static validateExercises(exercises: RoutineExercise[]): RoutineExercise[] {
        const ids = exercises.map((exercise) => exercise.getExerciseId());
        if (new Set(ids).size !== ids.length) {
            throw new InvalidRoutineException("A routine cannot contain the same exercise twice.");
        }
        return [...exercises];
    }

    get Id(): string {
        return this.props.id;
    }

    getUserId(): string {
        return this.props.userId;
    }

    getName(): string {
        return this.props.name;
    }

    getDate(): Date {
        return this.props.date;
    }

    getFrequency(): number {
        return this.props.frequency;
    }

    getExercises(): RoutineExercise[] {
        return [...this.props.exercises];
    }

    getExerciseIds(): string[] {
        return this.props.exercises.map((exercise) => exercise.getExerciseId());
    }
}
