import { Role } from "../models/enums/Role.enum.js";

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
    sub: string;
    email: string;
    roles: Role[];
}

export interface TokenServicePort {
    generateToken(payload: TokenPayload): Promise<string>;
}
