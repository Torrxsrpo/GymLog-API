import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { Exercise } from "../../domain/models/Exercise.entity.js";
import { MuscleGroup } from "../../domain/models/MuscleGroup.entity.js";
import { exerciseMapper, muscleGroupMapper } from "./Exercise.mapper.js";
import { ExerciseOrmEntity } from "./ExerciseOrm.entity.js";
import { MuscleGroupOrmEntity } from "./MuscleGroupOrm.entity.js";

const SAMPLE_CATALOG: Record<string, string[]> = {
    'Pecho': ['Press de banca', 'Press inclinado con mancuernas', 'Aperturas con mancuernas', 'Fondos en paralelas'],
    'Espalda': ['Dominadas', 'Remo con barra', 'Jalón al pecho', 'Peso muerto'],
    'Piernas': ['Sentadilla', 'Prensa de piernas', 'Zancadas', 'Curl femoral'],
    'Hombros': ['Press militar', 'Elevaciones laterales', 'Face pull'],
    'Bíceps': ['Curl con barra', 'Curl martillo'],
    'Tríceps': ['Extensión de tríceps en polea', 'Press francés'],
    'Abdomen': ['Plancha', 'Crunch abdominal'],
};

// Inserta grupos musculares y ejercicios de ejemplo al arrancar si el catálogo está vacío
@Injectable()
export class ExerciseSeeder implements OnApplicationBootstrap {
    private readonly logger = new Logger(ExerciseSeeder.name);

    constructor(
        @InjectRepository(MuscleGroupOrmEntity)
        private readonly muscleGroupRepository: Repository<MuscleGroupOrmEntity>,
        @InjectRepository(ExerciseOrmEntity)
        private readonly exerciseRepository: Repository<ExerciseOrmEntity>,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        if (await this.muscleGroupRepository.count() > 0) {
            return;
        }

        const muscleGroups = Object.keys(SAMPLE_CATALOG).map((name) => MuscleGroup.create(name));
        const exercises = muscleGroups.flatMap((group) =>
            SAMPLE_CATALOG[group.getName()].map((name) =>
                Exercise.create({ id: randomUUID(), name, img: null, muscleGroupId: group.Id }),
            ),
        );

        await this.muscleGroupRepository.save(muscleGroups.map(muscleGroupMapper.toOrm));
        await this.exerciseRepository.save(exercises.map(exerciseMapper.toOrm));
        this.logger.log(`Seeded ${muscleGroups.length} muscle groups and ${exercises.length} exercises`);
    }
}
