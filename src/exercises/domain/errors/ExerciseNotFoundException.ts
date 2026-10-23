import { ResourceNotFoundError } from "../../../common/errors/domain-errors.js";

export class ExerciseNotFoundException extends ResourceNotFoundError {
    constructor(ids: string | string[]) {
        super(`Exercise not found: ${[ids].flat().join(", ")}.`);
    }
}
