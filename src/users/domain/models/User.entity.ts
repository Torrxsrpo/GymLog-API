import { Role } from "./enums/Role.enum.js";
import { PasswordLengthException } from  "../errors/PasswordLengthException.js";
import { EmailException } from "../errors/EmailException.js";

export interface UserProps{
    id: string;
    name: string;
    email: string;
    password: string;
    status: boolean;
    Roles: Role[];
}

export class User{
     constructor(private props: UserProps){
        this.validateEmail(props.email);
        this.validatePassword(props.password);
     }


   

   

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

    getEmail(): string {
        return this.props.email;
    }

    setEmail(email: string): void {
        this.validateEmail(email);
        this.props.email = email;
    }

    getPassword(): string {
        return this.props.password;
    }

    setPassword(password: string): void {
        this.validatePassword(password);
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

    validatePassword(password: string){
        if (password.length < 8) {
            throw new PasswordLengthException("Password must be at least 8 characters long.");
        }

    }

    validateEmail(email: string) {
        const userEmail = email.includes('@');
        if (!userEmail) {
            throw new EmailException("Invalid email address.");
        }
    }
}