import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { GetExercisesUseCase } from "../../../application/use-cases/get-Exercises.CaseUse.js";
import { GetExerciseUseCase } from "../../../application/use-cases/get-Exercise.CaseUse.js";
import { CreateExerciseUseCase } from "../../../application/use-cases/create-Exercise.CaseUse.js";
import { CreateExerciseDto, GetExercisesQueryDto } from "../dtos/Exercise.dto.js";

@Controller('exercises')
export class ExercisesController {
    constructor(
        private readonly getExercisesUseCase: GetExercisesUseCase,
        private readonly getExerciseUseCase: GetExerciseUseCase,
        private readonly createExerciseUseCase: CreateExerciseUseCase,
    ) {}

    @Get()
    findAll(@Query() query: GetExercisesQueryDto) {
        return this.getExercisesUseCase.execute(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.getExerciseUseCase.execute(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateExerciseDto) {
        return this.createExerciseUseCase.execute(dto);
    }
}
