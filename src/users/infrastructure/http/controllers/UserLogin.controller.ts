import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { userloginDto } from "../dtos/UserLogin.dto.js";
import { RegisterUserDto } from "../dtos/RegisterUser.dto.js";
import { CreateUserUseCase } from "../../../application/use-cases/create-User.CaseUse.js";
import { LoginUserUseCase } from "../../../application/use-cases/login-User.CaseUse.js";



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
        return this.createUserUseCase.execute(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: userloginDto ) {
        return this.loginUserUseCase.execute(loginDto);
    }
}
