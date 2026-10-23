import { InvalidExerciseException } from "../errors/InvalidExerciseException.js";

export interface MuscleGroupProps {
    id: string;
    name: string;
}

export class MuscleGroup {
    private static readonly MAX_NAME_LENGTH = 50;

    constructor(private props: MuscleGroupProps) {}

    // El id es un slug legible derivado del nombre: "Bíceps" -> "biceps"
    static create(name: string): MuscleGroup {
        const trimmed = name?.trim() ?? "";
        if (trimmed.length === 0) {
            throw new InvalidExerciseException("Muscle group name is required.");
        }
        if (trimmed.length > MuscleGroup.MAX_NAME_LENGTH) {
            throw new InvalidExerciseException(`Muscle group name must be at most ${MuscleGroup.MAX_NAME_LENGTH} characters long.`);
        }

        return new MuscleGroup({ id: MuscleGroup.slugify(trimmed), name: trimmed });
    }

    private static slugify(name: string): string {
        return name
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    get Id(): string {
        return this.props.id;
    }

    getName(): string {
        return this.props.name;
    }
}
