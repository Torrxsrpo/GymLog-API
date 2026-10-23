import { CreateRoutineUseCase } from './create-Routine.CaseUse.js';
import { UpdateRoutineUseCase } from './update-Routine.CaseUse.js';
import { GetRoutineUseCase } from './get-Routine.CaseUse.js';
import { DeleteRoutineUseCase } from './delete-Routine.CaseUse.js';
import { RoutineRepositoryPort } from '../../domain/ports/RoutineRepository.port.js';
import { Routine } from '../../domain/models/Routine.entity.js';
import { RoutineExercise } from '../../domain/models/RoutineExercise.vo.js';
import { RoutineNotFoundException } from '../../domain/errors/RoutineNotFoundException.js';
import { InvalidRoutineException } from '../../domain/errors/InvalidRoutineException.js';
import { ExerciseCatalogService } from '../../../exercises/application/services/ExerciseCatalog.service.js';
import { ExerciseNotFoundException } from '../../../exercises/domain/errors/ExerciseNotFoundException.js';

describe('Casos de uso de rutinas', () => {
  const userId = 'user-id';
  const buildRoutine = () =>
    Routine.create({
      id: 'routine-id',
      userId,
      name: 'Pierna',
      date: new Date('2026-10-01'),
      frequency: 2,
      exercises: [RoutineExercise.create({ exerciseId: 'sentadilla', targetSets: 4, targetReps: 8 })],
    });

  let routineRepository: RoutineRepositoryPort;
  let exerciseCatalog: ExerciseCatalogService;

  beforeEach(() => {
    routineRepository = {
      save: vi.fn(async (routine: Routine) => routine),
      findByIdForUser: vi.fn(async () => buildRoutine()),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    exerciseCatalog = { ensureExist: vi.fn(async () => undefined) } as unknown as ExerciseCatalogService;
  });

  describe('CreateRoutineUseCase', () => {
    const input = {
      name: 'Torso',
      frequency: 3,
      exercises: [
        { exerciseId: 'press', targetSets: 4, targetReps: 10 },
        { exerciseId: 'remo', targetSets: 3, targetReps: 12 },
      ],
    };

    it('crea la rutina para el usuario del token y la devuelve', async () => {
      const response = await new CreateRoutineUseCase(routineRepository, exerciseCatalog).execute(userId, input);

      expect(response).toEqual({
        id: expect.any(String),
        name: 'Torso',
        date: expect.any(Date),
        frequency: 3,
        exercises: input.exercises,
      });
      const saved = vi.mocked(routineRepository.save).mock.calls[0][0];
      expect(saved.getUserId()).toBe(userId);
      expect(exerciseCatalog.ensureExist).toHaveBeenCalledWith(['press', 'remo']);
    });

    it('no guarda si algún ejercicio no existe', async () => {
      vi.mocked(exerciseCatalog.ensureExist).mockRejectedValueOnce(new ExerciseNotFoundException('remo'));

      await expect(new CreateRoutineUseCase(routineRepository, exerciseCatalog).execute(userId, input)).rejects.toThrow(
        ExerciseNotFoundException,
      );
      expect(routineRepository.save).not.toHaveBeenCalled();
    });

    it('no consulta el catálogo si los datos de la rutina son inválidos', async () => {
      await expect(
        new CreateRoutineUseCase(routineRepository, exerciseCatalog).execute(userId, { ...input, frequency: 9 }),
      ).rejects.toThrow(InvalidRoutineException);
      expect(exerciseCatalog.ensureExist).not.toHaveBeenCalled();
    });
  });

  describe('GetRoutineUseCase', () => {
    it('busca la rutina filtrando por el usuario del token', async () => {
      await new GetRoutineUseCase(routineRepository).execute(userId, 'routine-id');

      expect(routineRepository.findByIdForUser).toHaveBeenCalledWith('routine-id', userId);
    });

    it('lanza RoutineNotFoundException si no existe o es de otro usuario', async () => {
      vi.mocked(routineRepository.findByIdForUser).mockResolvedValueOnce(null);

      await expect(new GetRoutineUseCase(routineRepository).execute('otro', 'routine-id')).rejects.toThrow(
        RoutineNotFoundException,
      );
    });
  });

  describe('UpdateRoutineUseCase', () => {
    it('actualiza solo los campos enviados sin consultar el catálogo', async () => {
      const response = await new UpdateRoutineUseCase(routineRepository, exerciseCatalog).execute(userId, 'routine-id', {
        name: 'Pierna pesada',
      });

      expect(response.name).toBe('Pierna pesada');
      expect(response.exercises).toEqual([{ exerciseId: 'sentadilla', targetSets: 4, targetReps: 8 }]);
      expect(exerciseCatalog.ensureExist).not.toHaveBeenCalled();
    });

    it('valida los ejercicios nuevos contra el catálogo', async () => {
      await new UpdateRoutineUseCase(routineRepository, exerciseCatalog).execute(userId, 'routine-id', {
        exercises: [{ exerciseId: 'prensa', targetSets: 3, targetReps: 12 }],
      });

      expect(exerciseCatalog.ensureExist).toHaveBeenCalledWith(['prensa']);
    });

    it('lanza RoutineNotFoundException y no guarda si la rutina no es del usuario', async () => {
      vi.mocked(routineRepository.findByIdForUser).mockResolvedValueOnce(null);

      await expect(
        new UpdateRoutineUseCase(routineRepository, exerciseCatalog).execute('otro', 'routine-id', { name: 'x' }),
      ).rejects.toThrow(RoutineNotFoundException);
      expect(routineRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('DeleteRoutineUseCase', () => {
    it('borra la rutina del usuario', async () => {
      await new DeleteRoutineUseCase(routineRepository).execute(userId, 'routine-id');

      expect(routineRepository.delete).toHaveBeenCalledWith('routine-id');
    });

    it('no borra rutinas de otro usuario', async () => {
      vi.mocked(routineRepository.findByIdForUser).mockResolvedValueOnce(null);

      await expect(new DeleteRoutineUseCase(routineRepository).execute('otro', 'routine-id')).rejects.toThrow(
        RoutineNotFoundException,
      );
      expect(routineRepository.delete).not.toHaveBeenCalled();
    });
  });
});
