import { DomainConflictError } from "../../../common/errors/domain-errors.js";

export class DuplicateCatalogEntryException extends DomainConflictError {
    constructor(entity: string, name: string) {
        super(`${entity} "${name}" already exists.`);
    }
}
