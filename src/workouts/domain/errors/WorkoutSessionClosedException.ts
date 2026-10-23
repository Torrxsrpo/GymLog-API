import { DomainConflictError } from "../../../common/errors/domain-errors.js";

export class WorkoutSessionClosedException extends DomainConflictError {
    constructor(status: string) {
        super(`Workout session is already ${status}.`);
    }
}
