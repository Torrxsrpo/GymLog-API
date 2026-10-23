// Bases para los errores de dominio: DomainExceptionFilter las traduce a 404, 400 y 409
export abstract class ResourceNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}

export abstract class DomainValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}

export abstract class DomainConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}
