
import { Inject, Injectable } from "@nestjs/common";
import { User} from "../../domain/models/User.entity.js";
import { USER_REPOSITORY, type UserRepositoryPort } from "../../domain/ports/UserRepository.port.js";
import { randomUUID } from "crypto";
import { Role } from "../../domain/models/enums/Role.enum.js";


///Crear los datos

interface UserInput {
    name: string;
    email: string;
    password: string;
}

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject (USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}



        async execute(userProps: UserInput): Promise<User> {

           
                const user = new User({
                id :randomUUID(),
                name: userProps.name,
                email: userProps.email,
                password: userProps.password,
                status: true,
                Roles: [Role.USER]

            });

            return await this.userRepository.createUser(user);


        

        }
}