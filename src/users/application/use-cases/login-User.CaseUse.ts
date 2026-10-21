import { Inject, Injectable } from "@nestjs/common";
import { User } from "../../domain/models/User.entity.js";
import { USER_REPOSITORY, type UserRepositoryPort } from "../../domain/ports/UserRepository.port.js";
import { TOKEN_SERVICE, type TokenServicePort } from "../../domain/ports/TokenService.port.js";
import { PASSWORD_HASHER, type PasswordHasherPort } from "../../domain/ports/PasswordHasher.port.js";
import { Email } from "../../domain/value-objects/Email.vo.js";
import { EmailException } from "../../domain/errors/EmailException.js";
import { InvalidCredentialsException } from "../../domain/errors/InvalidCredentialsException.js";

interface LoginInput {
    email: string;
    password: string;
}

export interface LoginOutput {
    user: User;
    accessToken: string;
}

@Injectable()
export class LoginUserUseCase {
    constructor(
        @Inject (USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
        @Inject (TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
        @Inject (PASSWORD_HASHER) private readonly passwordHasher: PasswordHasherPort) {}

    async execute(credentials: LoginInput): Promise<LoginOutput> {
        const email = this.parseEmail(credentials.email);

        const user = await this.userRepository.findByEmail(email);

        // Mismo error para usuario inexistente, inactivo o contraseña incorrecta: no revelamos cuál falló
        if (!user || !user.getStatus()) {
            throw new InvalidCredentialsException();
        }

        const passwordMatches = await this.passwordHasher.compare(credentials.password, user.getPassword().getValue());
        if (!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        const accessToken = await this.tokenService.generateToken({
            sub: user.Id,
            email: user.getEmail().getValue(),
            roles: user.getRoles(),
        });

        return { user, accessToken };
    }

    private parseEmail(email: string): Email {
        try {
            return Email.create(email);
        } catch (error) {
            if (error instanceof EmailException) {
                throw new InvalidCredentialsException();
            }
            throw error;
        }
    }
}
