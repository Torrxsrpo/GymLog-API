import { WorkoutSession } from "../../domain/models/WorkoutSession.entity.js";
import { SessionStatus } from "../../domain/models/enums/SessionStatus.enum.js";

export interface SetLogResponse {
    id: string;
    exerciseId: string;
    reps: number;
    weight: number;
    createdAt: Date;
}

export interface WorkoutSessionResponse {
    id: string;
    routineId: string | null;
    time: Date;
    status: SessionStatus;
    notes: string | null;
    sets: SetLogResponse[];
}

export function toWorkoutSessionResponse(session: WorkoutSession): WorkoutSessionResponse {
    return {
        id: session.Id,
        routineId: session.getRoutineId(),
        time: session.getTime(),
        status: session.getStatus(),
        notes: session.getNotes(),
        sets: session.getSets().map((set) => ({
            id: set.Id,
            exerciseId: set.getExerciseId(),
            reps: set.getReps(),
            weight: set.getWeight(),
            createdAt: set.getCreatedAt(),
        })),
    };
}
