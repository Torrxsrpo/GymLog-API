import { Role } from "./enums/Role.enum.js";
import { PasswordLengthException } from  "../errors/PasswordLengthException.js";
import { EmailException } from "../errors/EmailException.js";

export interface UserProps{
    id: String;
    name: String;
    email: String;
    password: String;
    status: boolean;
    Roles: Role[];
}

export class User{

    constructor(props: UserProps){
    this.validateEmail(props.email);
    this.validatePassword(props.password);

        
    }


    validatePassword(password: String){
        if (password.length < 8) {
            throw new PasswordLengthException("Password must be at least 8 characters long.");
    }

}

    validateEmail(email: String) {
      const userEmail =  email.includes('@');
      if (!userEmail) {
        throw new EmailException("Invalid email address.");
      }
    }
}