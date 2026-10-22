import { User } from "../../domain/models/User.entity.js";
import { Role } from "../../domain/models/enums/Role.enum.js";

export interface UserResponse {
    id: string;
    name: string;
    email: string;
    status: boolean;
    roles: Role[];
}

export interface AuthResponse {
    user: UserResponse;
    accessToken: string;
}

// Nunca devolvemos la contraseña en la respuesta
export function toAuthResponse(user: User, accessToken: string): AuthResponse {
    return {
        user: {
            id: user.Id,
            name: user.getName(),
            email: user.getEmail().getValue(),
            status: user.getStatus(),
            roles: user.getRoles(),
        },
        accessToken,
    };
}
