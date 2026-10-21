import { Role } from "./enums/Role.enum.js";
import { Email } from "../value-objects/Email.vo.js";
import { Password } from "../value-objects/Password.vo.js";

export interface UserProps{
    id: string;
    name: string;
    email: Email;
    password: Password;
    status: boolean;
    Roles: Role[];
}

export class User{
     constructor(private props: UserProps){}


    get Id(): string {
        return this.props.id;
    }

    setId(id: string): void {
        this.props.id = id;
    }

    getName(): string {
        return this.props.name;
    }

    setName(name: string): void {
        this.props.name = name;
    }

    getEmail(): Email {
        return this.props.email;
    }

    setEmail(email: Email): void {
        this.props.email = email;
    }

    getPassword(): Password {
        return this.props.password;
    }

    setPassword(password: Password): void {
        this.props.password = password;
    }

    getStatus(): boolean {
        return this.props.status;
    }

    setStatus(status: boolean): void {
        this.props.status = status;
    }

    getRoles(): Role[] {
        return this.props.Roles;
    }

    setRoles(roles: Role[]): void {
        this.props.Roles = roles;
    }
}
