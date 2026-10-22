import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { PasswordHasherPort } from "../../domain/ports/PasswordHasher.port.js";

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
    private static readonly SALT_ROUNDS = 10;

    async hash(plainPassword: string): Promise<string> {
        return await bcrypt.hash(plainPassword, BcryptPasswordHasher.SALT_ROUNDS);
    }

    async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}
