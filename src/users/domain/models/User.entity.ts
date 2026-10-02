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
    private id: string;
    private name: string;
    private email: string;
    private password: string;
    private status: boolean;
    private Roles: Role[];

    constructor(props: UserProps){
        this.setId(props.id);
        this.setName(props.name);
        this.setEmail(props.email);
        this.setPassword(props.password);
        this.setStatus(props.status);
        this.setRoles(props.Roles);
    }

    get Id(): string {
        return this.id;
    }

    setId(id: string): void {
        this.id = id;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getEmail(): string {
        return this.email;
    }

    setEmail(email: string): void {
        this.validateEmail(email);
        this.email = email;
    }

    getPassword(): string {
        return this.password;
    }

    setPassword(password: string): void {
        this.validatePassword(password);
        this.password = password;
    }

    getStatus(): boolean {
        return this.status;
    }

    setStatus(status: boolean): void {
        this.status = status;
    }

    getRoles(): Role[] {
        return this.Roles;
    }

    setRoles(roles: Role[]): void {
        this.Roles = roles;
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