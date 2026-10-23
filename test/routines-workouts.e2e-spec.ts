import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { DomainExceptionFilter } from './../src/common/filters/domain-exception.filter.js';
import { UserOrmEntity } from './../src/users/infrastructure/persistence/UserOrm.entity.js';

describe('Rutinas y sesiones de entrenamiento (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<UserOrmEntity>;

  const password = 'Abcdef12';
  const createdEmails: string[] = [];
  let token: string;
  let otherToken: string;
  let exerciseIds: string[];

  const http = () => request(app.getHttpServer());
  const register = async () => {
    const email = `e2e-${randomUUID()}@test.com`;
    createdEmails.push(email);
    const { body } = await http().post('/auth/register').send({ name: 'Emmanuel', email, password }).expect(201);
    return body.accessToken as string;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Misma configuración que en main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    usersRepository = app.get(getRepositoryToken(UserOrmEntity));
    token = await register();
    otherToken = await register();

    // El seeder carga el catálogo al arrancar
    const { body } = await http().get('/exercises').set('Authorization', `Bearer ${token}`).expect(200);
    exerciseIds = body.slice(0, 3).map((exercise: { id: string }) => exercise.id);
  });

  afterAll(async () => {
    // Borrar los usuarios borra en cascada sus rutinas y sesiones
    if (usersRepository) {
      await usersRepository.delete({ email: In(createdEmails) });
    }
    await app?.close();
  });

  describe('catálogo', () => {
    it('lista grupos musculares y filtra ejercicios por grupo', async () => {
      const groups = await http().get('/muscle-groups').set('Authorization', `Bearer ${token}`).expect(200);
      expect(groups.body.length).toBeGreaterThan(0);

      const groupId = groups.body[0].id;
      const exercises = await http()
        .get('/exercises')
        .query({ muscleGroupId: groupId })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(exercises.body.length).toBeGreaterThan(0);
      expect(exercises.body.every((exercise: { muscleGroupId: string }) => exercise.muscleGroupId === groupId)).toBe(true);
    });
  });

  describe('rutinas', () => {
    let routineId: string;

    it('crea, lee, actualiza y borra una rutina propia', async () => {
      const created = await http()
        .post('/routines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Torso',
          frequency: 3,
          exercises: [
            { exerciseId: exerciseIds[0], targetSets: 4, targetReps: 10 },
            { exerciseId: exerciseIds[1], targetSets: 3, targetReps: 12 },
          ],
        })
        .expect(201);
      routineId = created.body.id;

      const updated = await http()
        .patch(`/routines/${routineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exercises: [{ exerciseId: exerciseIds[2], targetSets: 5, targetReps: 5 }, { exerciseId: exerciseIds[0], targetSets: 4, targetReps: 8 }] })
        .expect(200);
      expect(updated.body.exercises.map((exercise: { exerciseId: string }) => exercise.exerciseId)).toEqual([exerciseIds[2], exerciseIds[0]]);

      const fetched = await http().get(`/routines/${routineId}`).set('Authorization', `Bearer ${token}`).expect(200);
      expect(fetched.body).toEqual(updated.body);

      const list = await http().get('/routines').set('Authorization', `Bearer ${token}`).expect(200);
      expect(list.body.map((routine: { id: string }) => routine.id)).toContain(routineId);
    });

    it('otro usuario no puede ver, editar ni borrar la rutina', async () => {
      await http().get(`/routines/${routineId}`).set('Authorization', `Bearer ${otherToken}`).expect(404);
      await http().patch(`/routines/${routineId}`).set('Authorization', `Bearer ${otherToken}`).send({ name: 'x' }).expect(404);
      await http().delete(`/routines/${routineId}`).set('Authorization', `Bearer ${otherToken}`).expect(404);

      const list = await http().get('/routines').set('Authorization', `Bearer ${otherToken}`).expect(200);
      expect(list.body).toEqual([]);
    });

    it.each([
      ['un ejercicio no existe', { exercises: [{ exerciseId: randomUUID(), targetSets: 3, targetReps: 10 }] }, 404],
      ['la frecuencia está fuera de rango', { frequency: 8 }, 400],
      ['faltan campos', { name: undefined }, 400],
    ])('responde error si %s', async (_caso, override, status) => {
      await http()
        .post('/routines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Inválida', frequency: 3, exercises: [], ...override })
        .expect(status);
    });

    it('borra la rutina', async () => {
      await http().delete(`/routines/${routineId}`).set('Authorization', `Bearer ${token}`).expect(204);
      await http().get(`/routines/${routineId}`).set('Authorization', `Bearer ${token}`).expect(404);
    });
  });

  describe('sesiones de entrenamiento', () => {
    it('registra series, termina la sesión y conserva el historial al borrar la rutina', async () => {
      const routine = await http()
        .post('/routines')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Pierna', frequency: 2, exercises: [{ exerciseId: exerciseIds[0], targetSets: 3, targetReps: 8 }] })
        .expect(201);

      const session = await http()
        .post('/workout-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ routineId: routine.body.id, notes: 'Día pesado' })
        .expect(201);
      expect(session.body).toMatchObject({ routineId: routine.body.id, status: 'in_progress', notes: 'Día pesado', sets: [] });
      const sessionId = session.body.id;

      await http()
        .post(`/workout-sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: exerciseIds[0], reps: 8, weight: 100 })
        .expect(201);
      const withSets = await http()
        .post(`/workout-sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: exerciseIds[0], reps: 6, weight: 102.5 })
        .expect(201);
      expect(withSets.body.sets.map((set: { reps: number; weight: number }) => [set.reps, set.weight])).toEqual([[8, 100], [6, 102.5]]);

      const afterDelete = await http()
        .delete(`/workout-sessions/${sessionId}/sets/${withSets.body.sets[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(afterDelete.body.sets).toHaveLength(1);

      await http()
        .patch(`/workout-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' })
        .expect(200);
      await http()
        .post(`/workout-sessions/${sessionId}/sets`)
        .set('Authorization', `Bearer ${token}`)
        .send({ exerciseId: exerciseIds[0], reps: 5, weight: 100 })
        .expect(409);

      await http().get(`/workout-sessions/${sessionId}`).set('Authorization', `Bearer ${otherToken}`).expect(404);

      await http().delete(`/routines/${routine.body.id}`).set('Authorization', `Bearer ${token}`).expect(204);
      const kept = await http().get(`/workout-sessions/${sessionId}`).set('Authorization', `Bearer ${token}`).expect(200);
      expect(kept.body).toMatchObject({ routineId: null, status: 'completed' });
      expect(kept.body.sets).toHaveLength(1);
    });

    it('no permite iniciar una sesión con la rutina de otro usuario', async () => {
      const routine = await http()
        .post('/routines')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Ajena', frequency: 1, exercises: [] })
        .expect(201);

      await http()
        .post('/workout-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ routineId: routine.body.id })
        .expect(404);
    });
  });
});
