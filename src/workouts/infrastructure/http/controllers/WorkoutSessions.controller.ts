import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { CurrentUser, type AuthenticatedUser } from "../../../../auth/infrastructure/decorators/current-user.decorator.js";
import { StartWorkoutSessionUseCase } from "../../../application/use-cases/start-WorkoutSession.CaseUse.js";
import { GetWorkoutSessionsUseCase } from "../../../application/use-cases/get-WorkoutSessions.CaseUse.js";
import { GetWorkoutSessionUseCase } from "../../../application/use-cases/get-WorkoutSession.CaseUse.js";
import { UpdateWorkoutSessionUseCase } from "../../../application/use-cases/update-WorkoutSession.CaseUse.js";
import { DeleteWorkoutSessionUseCase } from "../../../application/use-cases/delete-WorkoutSession.CaseUse.js";
import { AddSetLogUseCase } from "../../../application/use-cases/add-SetLog.CaseUse.js";
import { DeleteSetLogUseCase } from "../../../application/use-cases/delete-SetLog.CaseUse.js";
import { AddSetLogDto, StartWorkoutSessionDto, UpdateWorkoutSessionDto } from "../dtos/WorkoutSession.dto.js";

// Cada usuario solo ve y modifica sus propias sesiones: el userId sale del token
@Controller('workout-sessions')
export class WorkoutSessionsController {
    constructor(
        private readonly startWorkoutSessionUseCase: StartWorkoutSessionUseCase,
        private readonly getWorkoutSessionsUseCase: GetWorkoutSessionsUseCase,
        private readonly getWorkoutSessionUseCase: GetWorkoutSessionUseCase,
        private readonly updateWorkoutSessionUseCase: UpdateWorkoutSessionUseCase,
        private readonly deleteWorkoutSessionUseCase: DeleteWorkoutSessionUseCase,
        private readonly addSetLogUseCase: AddSetLogUseCase,
        private readonly deleteSetLogUseCase: DeleteSetLogUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    start(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartWorkoutSessionDto) {
        return this.startWorkoutSessionUseCase.execute(user.sub, dto);
    }

    @Get()
    findAll(@CurrentUser() user: AuthenticatedUser) {
        return this.getWorkoutSessionsUseCase.execute(user.sub);
    }

    @Get(':id')
    findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.getWorkoutSessionUseCase.execute(user.sub, id);
    }

    @Patch(':id')
    update(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkoutSessionDto) {
        return this.updateWorkoutSessionUseCase.execute(user.sub, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
        return this.deleteWorkoutSessionUseCase.execute(user.sub, id);
    }

    @Post(':id/sets')
    @HttpCode(HttpStatus.CREATED)
    addSet(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AddSetLogDto) {
        return this.addSetLogUseCase.execute(user.sub, id, dto);
    }

    @Delete(':id/sets/:setId')
    removeSet(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('setId', ParseUUIDPipe) setId: string,
    ) {
        return this.deleteSetLogUseCase.execute(user.sub, id, setId);
    }
}
