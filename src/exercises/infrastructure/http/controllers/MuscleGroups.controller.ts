import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { GetMuscleGroupsUseCase } from "../../../application/use-cases/get-MuscleGroups.CaseUse.js";
import { CreateMuscleGroupUseCase } from "../../../application/use-cases/create-MuscleGroup.CaseUse.js";
import { CreateMuscleGroupDto } from "../dtos/Exercise.dto.js";

@Controller('muscle-groups')
export class MuscleGroupsController {
    constructor(
        private readonly getMuscleGroupsUseCase: GetMuscleGroupsUseCase,
        private readonly createMuscleGroupUseCase: CreateMuscleGroupUseCase,
    ) {}

    @Get()
    findAll() {
        return this.getMuscleGroupsUseCase.execute();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateMuscleGroupDto) {
        return this.createMuscleGroupUseCase.execute(dto);
    }
}
