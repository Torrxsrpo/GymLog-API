import { ResourceNotFoundError } from "../../../common/errors/domain-errors.js";

// También se usa cuando la rutina es de otro usuario, para no revelar que existe
export class RoutineNotFoundException extends ResourceNotFoundError {
    constructor(id: string) {
        super(`Routine not found: ${id}.`);
    }
}
