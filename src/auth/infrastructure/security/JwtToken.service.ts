import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenPayload, TokenServicePort } from "../../domain/ports/TokenService.port.js";

@Injectable()
export class JwtTokenService implements TokenServicePort {
    constructor(private readonly jwtService: JwtService) {}

    async generateToken(payload: TokenPayload): Promise<string> {
        return await this.jwtService.signAsync({ ...payload });
    }
}
