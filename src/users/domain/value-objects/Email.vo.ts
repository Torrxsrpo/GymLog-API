import { EmailException } from "../errors/EmailException.js";

export class Email {
    private static readonly MAX_LENGTH = 254;
    private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    private constructor(private readonly value: string) {}

    static create(email: string): Email {
        if (email === undefined || email === null || email.trim().length === 0) {
            throw new EmailException("Email is required.");
        }

        const normalized = email.trim().toLowerCase();

        if (normalized.length > Email.MAX_LENGTH) {
            throw new EmailException(`Email must be at most ${Email.MAX_LENGTH} characters long.`);
        }

        if (!Email.EMAIL_REGEX.test(normalized)) {
            throw new EmailException("Invalid email address.");
        }

        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.getValue();
    }

    toString(): string {
        return this.value;
    }
}
