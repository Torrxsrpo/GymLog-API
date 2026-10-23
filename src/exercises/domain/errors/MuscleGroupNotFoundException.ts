import { ResourceNotFoundError } from "../../../common/errors/domain-errors.js";

export class MuscleGroupNotFoundException extends ResourceNotFoundError {
    constructor(id: string) {
        super(`Muscle group not found: ${id}.`);
    }
}
