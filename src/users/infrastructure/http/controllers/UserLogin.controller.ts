import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { userloginDto } from "../dtos/UserLogin.dto.js";
import { CreateUserUseCase } from "../../../application/use-cases/create-User.CaseUse.js";



@Controller('users')
export class UserLoginController {
    constructor(
                private readonly createUserUseCase: CreateUserUseCase

    ) {

    }


    @Post('login')
    @HttpCode(HttpStatus.CREATED)
    async createuser(@Body() createUserDto: userloginDto ) {
        const { user, accessToken } = await this.createUserUseCase.execute(createUserDto);

        // Nunca devolvemos la contraseña en la respuesta
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
