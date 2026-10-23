import { CreateExerciseUseCase } from './create-Exercise.CaseUse.js';
import { CreateMuscleGroupUseCase } from './create-MuscleGroup.CaseUse.js';
import { ExerciseRepositoryPort } from '../../domain/ports/ExerciseRepository.port.js';
import { MuscleGroupRepositoryPort } from '../../domain/ports/MuscleGroupRepository.port.js';
import { Exercise } from '../../domain/models/Exercise.entity.js';
import { MuscleGroup } from '../../domain/models/MuscleGroup.entity.js';
import { MuscleGroupNotFoundException } from '../../domain/errors/MuscleGroupNotFoundException.js';
import { DuplicateCatalogEntryException } from '../../domain/errors/DuplicateCatalogEntryException.js';

describe('CreateExerciseUseCase', () => {
  const input = { name: 'Remo con mancuerna', muscleGroupId: 'espalda' };

  let exerciseRepository: ExerciseRepositoryPort;
  let muscleGroupRepository: MuscleGroupRepositoryPort;
  let useCase: CreateExerciseUseCase;

  beforeEach(() => {
    exerciseRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findByName: vi.fn(async () => null),
      save: vi.fn(async (exercise: Exercise) => exercise),
    };
    muscleGroupRepository = {
      findAll: vi.fn(),
      findById: vi.fn(async () => MuscleGroup.create('Espalda')),
      save: vi.fn(),
    };
    useCase = new CreateExerciseUseCase(exerciseRepository, muscleGroupRepository);
  });

  it('crea el ejercicio y devuelve la respuesta', async () => {
    const response = await useCase.execute(input);

    expect(response).toEqual({ id: expect.any(String), name: 'Remo con mancuerna', img: null, muscleGroupId: 'espalda' });
    expect(exerciseRepository.save).toHaveBeenCalledOnce();
  });

  it('lanza MuscleGroupNotFoundException si el grupo muscular no existe', async () => {
    vi.mocked(muscleGroupRepository.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute(input)).rejects.toThrow(MuscleGroupNotFoundException);
    expect(exerciseRepository.save).not.toHaveBeenCalled();
  });

  it('lanza DuplicateCatalogEntryException si ya existe un ejercicio con ese nombre', async () => {
    vi.mocked(exerciseRepository.findByName).mockResolvedValueOnce(
      new Exercise({ id: 'otro', name: 'Remo con mancuerna', img: null, muscleGroupId: 'espalda' }),
    );

    await expect(useCase.execute(input)).rejects.toThrow(DuplicateCatalogEntryException);
    expect(exerciseRepository.save).not.toHaveBeenCalled();
  });
});

describe('CreateMuscleGroupUseCase', () => {
  let muscleGroupRepository: MuscleGroupRepositoryPort;
  let useCase: CreateMuscleGroupUseCase;

  beforeEach(() => {
    muscleGroupRepository = {
      findAll: vi.fn(),
      findById: vi.fn(async () => null),
      save: vi.fn(async (group: MuscleGroup) => group),
    };
    useCase = new CreateMuscleGroupUseCase(muscleGroupRepository);
  });

  it('crea el grupo muscular con un id legible', async () => {
    expect(await useCase.execute({ name: 'Glúteos' })).toEqual({ id: 'gluteos', name: 'Glúteos' });
  });

  it('lanza DuplicateCatalogEntryException si ya existe', async () => {
    vi.mocked(muscleGroupRepository.findById).mockResolvedValueOnce(MuscleGroup.create('Glúteos'));

    await expect(useCase.execute({ name: 'glúteos' })).rejects.toThrow(DuplicateCatalogEntryException);
  });
});
