import { User } from "../models/User.entity.js";


export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
    createUser(user: User): Promise<User>;

}   