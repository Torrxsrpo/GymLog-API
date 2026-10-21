import { PasswordLengthException } from "../errors/PasswordLengthException.js";
import { PasswordFormatException } from "../errors/PasswordFormatException.js";

export class Password {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 64;

    private constructor(private readonly value: string) {}

    static create(password: string): Password {
        if (password === undefined || password === null || password.length === 0) {
            throw new PasswordFormatException("Password is required.");
        }

        if (password.length < Password.MIN_LENGTH) {
            throw new PasswordLengthException(`Password must be at least ${Password.MIN_LENGTH} characters long.`);
        }

        if (password.length > Password.MAX_LENGTH) {
            throw new PasswordLengthException(`Password must be at most ${Password.MAX_LENGTH} characters long.`);
        }

        if (/\s/.test(password)) {
            throw new PasswordFormatException("Password must not contain whitespace.");
        }

        if (!/[A-Z]/.test(password)) {
            throw new PasswordFormatException("Password must contain at least one uppercase letter.");
        }

        if (!/[a-z]/.test(password)) {
            throw new PasswordFormatException("Password must contain at least one lowercase letter.");
        }

        if (!/\d/.test(password)) {
            throw new PasswordFormatException("Password must contain at least one number.");
        }

        return new Password(password);
    }

    // Reconstruye una contraseña ya hasheada (p. ej. desde la BD), sin aplicar las reglas de formato
    static fromHash(hashedPassword: string): Password {
        if (hashedPassword === undefined || hashedPassword === null || hashedPassword.length === 0) {
            throw new PasswordFormatException("Password hash is required.");
        }

        return new Password(hashedPassword);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Password): boolean {
        return this.value === other.getValue();
    }
}
