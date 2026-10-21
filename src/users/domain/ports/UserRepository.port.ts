import { User } from "../models/User.entity.js";
import { Email } from "../value-objects/Email.vo.js";


export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
    createUser(user: User): Promise<User>;
    findByEmail(email: Email): Promise<User | null>;

}
