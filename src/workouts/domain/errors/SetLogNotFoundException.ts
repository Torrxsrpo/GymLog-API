import { ResourceNotFoundError } from "../../../common/errors/domain-errors.js";

export class SetLogNotFoundException extends ResourceNotFoundError {
    constructor(id: string) {
        super(`Set not found: ${id}.`);
    }
}
