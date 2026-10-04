import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { userloginDto } from "./dtos/UserLogin.dto.js";
import { CreateUserUseCase } from "../../application/use-cases/create-User.CaseUse.js";



@Controller('users')
export class UserLoginController {
    constructor(
                private readonly createUserUseCase: CreateUserUseCase

    ) {
        
    }


    @Post('login')
    @HttpCode(HttpStatus.CREATED)
    createuser(@Body() createUserDto: userloginDto ) {
        return this.createUserUseCase.execute(createUserDto);
        
    
    }



}
