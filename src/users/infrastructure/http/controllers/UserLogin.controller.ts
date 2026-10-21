import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { userloginDto } from "../dtos/UserLogin.dto.js";
import { RegisterUserDto } from "../dtos/RegisterUser.dto.js";
import { CreateUserUseCase } from "../../../application/use-cases/create-User.CaseUse.js";
import { LoginUserUseCase } from "../../../application/use-cases/login-User.CaseUse.js";
import { User } from "../../../domain/models/User.entity.js";



@Controller('users')
export class UserLoginController {
    constructor(
                private readonly createUserUseCase: CreateUserUseCase,
                private readonly loginUserUseCase: LoginUserUseCase

    ) {

    }


    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async createuser(@Body() createUserDto: RegisterUserDto ) {
        const { user, accessToken } = await this.createUserUseCase.execute(createUserDto);
        return this.toResponse(user, accessToken);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: userloginDto ) {
        const { user, accessToken } = await this.loginUserUseCase.execute(loginDto);
        return this.toResponse(user, accessToken);
    }

    // Nunca devolvemos la contraseña en la respuesta
    private toResponse(user: User, accessToken: string) {
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



}
