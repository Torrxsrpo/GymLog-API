import { StartWorkoutSessionUseCase } from './start-WorkoutSession.CaseUse.js';
import { UpdateWorkoutSessionUseCase } from './update-WorkoutSession.CaseUse.js';
import { DeleteWorkoutSessionUseCase } from './delete-WorkoutSession.CaseUse.js';
import { AddSetLogUseCase } from './add-SetLog.CaseUse.js';
import { DeleteSetLogUseCase } from './delete-SetLog.CaseUse.js';
import { OwnedWorkoutSessionService } from '../services/OwnedWorkoutSession.service.js';
import { WorkoutSessionRepositoryPort } from '../../domain/ports/WorkoutSessionRepository.port.js';
import { WorkoutSession } from '../../domain/models/WorkoutSession.entity.js';
import { SessionStatus } from '../../domain/models/enums/SessionStatus.enum.js';
import { WorkoutSessionNotFoundException } from '../../domain/errors/WorkoutSessionNotFoundException.js';
import { WorkoutSessionClosedException } from '../../domain/errors/WorkoutSessionClosedException.js';
import { RoutineRepositoryPort } from '../../../routines/domain/ports/RoutineRepository.port.js';
import { Routine } from '../../../routines/domain/models/Routine.entity.js';
import { RoutineNotFoundException } from '../../../routines/domain/errors/RoutineNotFoundException.js';
import { ExerciseCatalogService } from '../../../exercises/application/services/ExerciseCatalog.service.js';
import { ExerciseNotFoundException } from '../../../exercises/domain/errors/ExerciseNotFoundException.js';

describe('Casos de uso de sesiones de entrenamiento', () => {
  const userId = 'user-id';
  let stored: WorkoutSession;

  let sessionRepository: WorkoutSessionRepositoryPort;
  let routineRepository: RoutineRepositoryPort;
  let exerciseCatalog: ExerciseCatalogService;
  let ownedSessions: OwnedWorkoutSessionService;

  beforeEach(() => {
    stored = WorkoutSession.start({ id: 'session-id', userId, routineId: null, time: new Date(), notes: null });
    sessionRepository = {
      save: vi.fn(async (session: WorkoutSession) => session),
      findByIdForUser: vi.fn(async (_id: string, owner: string) => (owner === userId ? stored : null)),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    routineRepository = {
      save: vi.fn(),
      findByIdForUser: vi.fn(async () => ({}) as Routine),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    exerciseCatalog = { ensureExist: vi.fn(async () => undefined) } as unknown as ExerciseCatalogService;
    ownedSessions = new OwnedWorkoutSessionService(sessionRepository);
  });

  describe('StartWorkoutSessionUseCase', () => {
    it('inicia una sesión en curso con la rutina del usuario', async () => {
      const response = await new StartWorkoutSessionUseCase(sessionRepository, routineRepository).execute(userId, {
        routineId: 'routine-id',
        notes: 'Día de pierna',
      });

      expect(response).toEqual({
        id: expect.any(String),
        routineId: 'routine-id',
        time: expect.any(Date),
        status: SessionStatus.IN_PROGRESS,
        notes: 'Día de pierna',
        sets: [],
      });
      expect(routineRepository.findByIdForUser).toHaveBeenCalledWith('routine-id', userId);
    });

    it('permite un entrenamiento libre sin rutina', async () => {
      const response = await new StartWorkoutSessionUseCase(sessionRepository, routineRepository).execute(userId, {});

      expect(response.routineId).toBeNull();
      expect(routineRepository.findByIdForUser).not.toHaveBeenCalled();
    });

    it('lanza RoutineNotFoundException si la rutina es de otro usuario', async () => {
      vi.mocked(routineRepository.findByIdForUser).mockResolvedValueOnce(null);

      await expect(
        new StartWorkoutSessionUseCase(sessionRepository, routineRepository).execute(userId, { routineId: 'ajena' }),
      ).rejects.toThrow(RoutineNotFoundException);
      expect(sessionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('sesiones de otro usuario', () => {
    it.each([
      ['actualizar', () => new UpdateWorkoutSessionUseCase(sessionRepository, ownedSessions).execute('otro', 'session-id', { notes: 'x' })],
      ['borrar', () => new DeleteWorkoutSessionUseCase(sessionRepository, ownedSessions).execute('otro', 'session-id')],
      ['añadir series', () => new AddSetLogUseCase(sessionRepository, ownedSessions, exerciseCatalog).execute('otro', 'session-id', { exerciseId: 'press', reps: 5, weight: 50 })],
      ['quitar series', () => new DeleteSetLogUseCase(sessionRepository, ownedSessions).execute('otro', 'session-id', 'set-id')],
    ])('no se pueden %s', async (_caso, run) => {
      await expect(run()).rejects.toThrow(WorkoutSessionNotFoundException);
      expect(sessionRepository.save).not.toHaveBeenCalled();
      expect(sessionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('AddSetLogUseCase', () => {
    it('añade la serie y devuelve la sesión actualizada', async () => {
      const response = await new AddSetLogUseCase(sessionRepository, ownedSessions, exerciseCatalog).execute(
        userId,
        'session-id',
        { exerciseId: 'press', reps: 8, weight: 70 },
      );

      expect(response.sets).toEqual([
        { id: expect.any(String), exerciseId: 'press', reps: 8, weight: 70, createdAt: expect.any(Date) },
      ]);
      expect(exerciseCatalog.ensureExist).toHaveBeenCalledWith(['press']);
    });

    it('no guarda si el ejercicio no existe', async () => {
      vi.mocked(exerciseCatalog.ensureExist).mockRejectedValueOnce(new ExerciseNotFoundException('press'));

      await expect(
        new AddSetLogUseCase(sessionRepository, ownedSessions, exerciseCatalog).execute(userId, 'session-id', {
          exerciseId: 'press',
          reps: 8,
          weight: 70,
        }),
      ).rejects.toThrow(ExerciseNotFoundException);
      expect(sessionRepository.save).not.toHaveBeenCalled();
    });

    it('lanza WorkoutSessionClosedException si la sesión ya terminó', async () => {
      stored.changeStatus(SessionStatus.COMPLETED);

      await expect(
        new AddSetLogUseCase(sessionRepository, ownedSessions, exerciseCatalog).execute(userId, 'session-id', {
          exerciseId: 'press',
          reps: 8,
          weight: 70,
        }),
      ).rejects.toThrow(WorkoutSessionClosedException);
    });
  });

  describe('UpdateWorkoutSessionUseCase', () => {
    it('termina la sesión y actualiza las notas', async () => {
      const response = await new UpdateWorkoutSessionUseCase(sessionRepository, ownedSessions).execute(userId, 'session-id', {
        status: SessionStatus.COMPLETED,
        notes: 'Nuevo récord',
      });

      expect(response.status).toBe(SessionStatus.COMPLETED);
      expect(response.notes).toBe('Nuevo récord');
      expect(sessionRepository.save).toHaveBeenCalledOnce();
    });
  });
});
