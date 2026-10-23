import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { CurrentUser, type AuthenticatedUser } from "../../../../auth/infrastructure/decorators/current-user.decorator.js";
import { CreateRoutineUseCase } from "../../../application/use-cases/create-Routine.CaseUse.js";
import { GetRoutinesUseCase } from "../../../application/use-cases/get-Routines.CaseUse.js";
import { GetRoutineUseCase } from "../../../application/use-cases/get-Routine.CaseUse.js";
import { UpdateRoutineUseCase } from "../../../application/use-cases/update-Routine.CaseUse.js";
import { DeleteRoutineUseCase } from "../../../application/use-cases/delete-Routine.CaseUse.js";
import { CreateRoutineDto, UpdateRoutineDto } from "../dtos/Routine.dto.js";

// Cada usuario solo ve y modifica sus propias rutinas: el userId sale del token
@Controller('routines')
export class RoutinesController {
    constructor(
        private readonly createRoutineUseCase: CreateRoutineUseCase,
        private readonly getRoutinesUseCase: GetRoutinesUseCase,
        private readonly getRoutineUseCase: GetRoutineUseCase,
        private readonly updateRoutineUseCase: UpdateRoutineUseCase,
        private readonly deleteRoutineUseCase: DeleteRoutineUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRoutineDto) {
        return this.createRoutineUseCase.execute(user.sub, dto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.getRoutinesUseCase.execute(user.sub);
    }

    @Get(':id')
    findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.getRoutineUseCase.execute(user.sub, id);
    }

    @Patch(':id')
    update(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoutineDto) {
        return this.updateRoutineUseCase.execute(user.sub, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.deleteRoutineUseCase.execute(user.sub, id);
    }
}
