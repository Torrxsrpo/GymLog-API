import { ExerciseCatalogService } from './ExerciseCatalog.service.js';
import { ExerciseRepositoryPort } from '../../domain/ports/ExerciseRepository.port.js';
import { Exercise } from '../../domain/models/Exercise.entity.js';
import { ExerciseNotFoundException } from '../../domain/errors/ExerciseNotFoundException.js';

describe('ExerciseCatalogService', () => {
  const exercise = (id: string) => new Exercise({ id, name: id, img: null, muscleGroupId: 'pecho' });

  let exerciseRepository: ExerciseRepositoryPort;
  let service: ExerciseCatalogService;

  beforeEach(() => {
    exerciseRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(async (ids: string[]) => ids.filter((id) => id !== 'missing').map(exercise)),
      findByName: vi.fn(),
      save: vi.fn(),
    };
    service = new ExerciseCatalogService(exerciseRepository);
  });

  it('no lanza si todos los ejercicios existen', async () => {
    await expect(service.ensureExist(['a', 'b'])).resolves.toBeUndefined();
  });

  it('no lanza con una lista vacía', async () => {
    await expect(service.ensureExist([])).resolves.toBeUndefined();
  });

  it('lanza ExerciseNotFoundException indicando los que faltan', async () => {
    await expect(service.ensureExist(['a', 'missing'])).rejects.toThrow('Exercise not found: missing.');
    await expect(service.ensureExist(['missing'])).rejects.toThrow(ExerciseNotFoundException);
  });
});
