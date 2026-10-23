import { SessionStatus } from "./enums/SessionStatus.enum.js";
import { SetLog } from "./SetLog.entity.js";
import { InvalidWorkoutException } from "../errors/InvalidWorkoutException.js";
import { WorkoutSessionClosedException } from "../errors/WorkoutSessionClosedException.js";
import { SetLogNotFoundException } from "../errors/SetLogNotFoundException.js";

export interface WorkoutSessionProps {
    id: string;
    userId: string;
    // null si la rutina se borró después o si es un entrenamiento libre
    routineId: string | null;
    // Fecha y hora de inicio de la sesión
    time: Date;
    status: SessionStatus;
    notes: string | null;
    sets: SetLog[];
}

interface StartSessionProps {
    id: string;
    userId: string;
    routineId: string | null;
    time: Date;
    notes: string | null;
}

export class WorkoutSession {
    private static readonly MAX_NOTES_LENGTH = 1000;

    constructor(private props: WorkoutSessionProps) {}

    static start(props: StartSessionProps): WorkoutSession {
        return new WorkoutSession({
            ...props,
            notes: WorkoutSession.validateNotes(props.notes),
            status: SessionStatus.IN_PROGRESS,
            sets: [],
        });
    }

    addSet(set: SetLog): void {
        this.ensureInProgress();
        this.props.sets.push(set);
    }

    removeSet(setId: string): void {
        this.ensureInProgress();
        const index = this.props.sets.findIndex((set) => set.Id === setId);
        if (index === -1) {
            throw new SetLogNotFoundException(setId);
        }
        this.props.sets.splice(index, 1);
    }

    // Una sesión solo puede cerrarse una vez: en curso -> completada | cancelada
    changeStatus(status: SessionStatus): void {
        if (status === this.props.status) {
            return;
        }
        this.ensureInProgress();
        if (status === SessionStatus.IN_PROGRESS) {
            throw new InvalidWorkoutException("A workout session cannot be reopened.");
        }
        this.props.status = status;
    }

    updateNotes(notes: string | null): void {
        this.props.notes = WorkoutSession.validateNotes(notes);
    }

    private ensureInProgress(): void {
        if (this.props.status !== SessionStatus.IN_PROGRESS) {
            throw new WorkoutSessionClosedException(this.props.status);
        }
    }

    private static validateNotes(notes: string | null): string | null {
        const trimmed = notes?.trim() || null;
        if (trimmed && trimmed.length > WorkoutSession.MAX_NOTES_LENGTH) {
            throw new InvalidWorkoutException(`Notes must be at most ${WorkoutSession.MAX_NOTES_LENGTH} characters long.`);
        }
        return trimmed;
    }

    get Id(): string {
        return this.props.id;
    }

    getUserId(): string {
        return this.props.userId;
    }

    getRoutineId(): string | null {
        return this.props.routineId;
    }

    getTime(): Date {
        return this.props.time;
    }

    getStatus(): SessionStatus {
        return this.props.status;
    }

    getNotes(): string | null {
        return this.props.notes;
    }

    getSets(): SetLog[] {
        return [...this.props.sets];
    }
}
