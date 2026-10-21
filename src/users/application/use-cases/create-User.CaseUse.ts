
import { Inject, Injectable } from "@nestjs/common";
import { User} from "../../domain/models/User.entity.js";
import { USER_REPOSITORY, type UserRepositoryPort } from "../../domain/ports/UserRepository.port.js";
import { TOKEN_SERVICE, type TokenServicePort } from "../../domain/ports/TokenService.port.js";
import { randomUUID } from "crypto";
import { Role } from "../../domain/models/enums/Role.enum.js";
import { Email } from "../../domain/value-objects/Email.vo.js";
import { Password } from "../../domain/value-objects/Password.vo.js";


///Crear los datos

interface UserInput {
    name: string;
    email: string;
    password: string;
}

export interface CreateUserOutput {
    user: User;
    accessToken: string;
}

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject (USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
        @Inject (TOKEN_SERVICE) private readonly tokenService: TokenServicePort) {}



        async execute(userProps: UserInput): Promise<CreateUserOutput> {


                const user = new User({
                id :randomUUID(),
                name: userProps.name,
                email: Email.create(userProps.email),
                password: Password.create(userProps.password),
                status: true,
                Roles: [Role.USER]

            });

            const createdUser = await this.userRepository.createUser(user);

            const accessToken = await this.tokenService.generateToken({
                sub: createdUser.Id,
                email: createdUser.getEmail().getValue(),
                roles: createdUser.getRoles(),
            });

            return { user: createdUser, accessToken };

        }
}
