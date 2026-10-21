export class PasswordFormatException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PasswordFormatException";
    }
}
