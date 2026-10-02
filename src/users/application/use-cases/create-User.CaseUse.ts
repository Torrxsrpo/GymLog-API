
import { Inject, Injectable } from "@nestjs/common";
import {UserProps, User} from "../../domain/models/User.entity.js";
import { USER_REPOSITORY, type UserRepositoryPort } from "../../domain/ports/UserRepository.port.js";
import { randomUUID } from "crypto";


///Crear los datos

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject (USER_REPOSITORY) private readonly userRepository: UserRepositoryPort) {}

        async execute(userProps: UserProps): Promise<User> {
            const user = new User({
                id :randomUUID(),
                name: userProps.name,
                email: userProps.email,
                password: userProps.password,
                status: userProps.status,
                Roles: userProps.Roles
            });

            return await this.userRepository.createUser(user);
        }
}