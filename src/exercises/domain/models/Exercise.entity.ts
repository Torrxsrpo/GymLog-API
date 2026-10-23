import { InvalidExerciseException } from "../errors/InvalidExerciseException.js";

export interface ExerciseProps {
    id: string;
    name: string;
    img: string | null;
    muscleGroupId: string;
}

export class Exercise {
    private static readonly MAX_NAME_LENGTH = 100;

    constructor(private props: ExerciseProps) {}

    static create(props: ExerciseProps): Exercise {
        const name = props.name?.trim() ?? "";
        if (name.length === 0) {
            throw new InvalidExerciseException("Exercise name is required.");
        }
        if (name.length > Exercise.MAX_NAME_LENGTH) {
            throw new InvalidExerciseException(`Exercise name must be at most ${Exercise.MAX_NAME_LENGTH} characters long.`);
        }

        return new Exercise({ ...props, name, img: props.img?.trim() || null });
    }

    get Id(): string {
        return this.props.id;
    }

    getName(): string {
        return this.props.name;
    }

    getImg(): string | null {
        return this.props.img;
    }

    getMuscleGroupId(): string {
        return this.props.muscleGroupId;
    }
}
