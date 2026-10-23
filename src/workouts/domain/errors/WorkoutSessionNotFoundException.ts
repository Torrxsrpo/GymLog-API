import { ResourceNotFoundError } from "../../../common/errors/domain-errors.js";

// También se usa cuando la sesión es de otro usuario, para no revelar que existe
export class WorkoutSessionNotFoundException extends ResourceNotFoundError {
    constructor(id: string) {
        super(`Workout session not found: ${id}.`);
    }
}
