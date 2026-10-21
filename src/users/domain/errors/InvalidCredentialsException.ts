export class InvalidCredentialsException extends Error {
    constructor(message: string = "Incorrect credentials.") {
        super(message);
        this.name = "InvalidCredentialsException";
    }
}
