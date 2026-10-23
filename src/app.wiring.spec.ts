import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter.js';
import { Role } from './users/domain/models/enums/Role.enum.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { ExercisesModule } from './exercises/exercises.module.js';
import { RoutinesModule } from './routines/routines.module.js';
import { WorkoutsModule } from './workouts/workouts.module.js';
import { UserOrmEntity } from './users/infrastructure/persistence/UserOrm.entity.js';
import { ProductOrmEntity } from './products/infrastructure/persistence/ProductOrm.entity.js';
import { MuscleGroupOrmEntity } from './exercises/infrastructure/persistence/MuscleGroupOrm.entity.js';
import { ExerciseOrmEntity } from './exercises/infrastructure/persistence/ExerciseOrm.entity.js';
import { RoutineOrmEntity } from './routines/infrastructure/persistence/RoutineOrm.entity.js';
import { RoutineExerciseOrmEntity } from './routines/infrastructure/persistence/RoutineExerciseOrm.entity.js';
import { WorkoutSessionOrmEntity } from './workouts/infrastructure/persistence/WorkoutSessionOrm.entity.js';
import { SetLogOrmEntity } from './workouts/infrastructure/persistence/SetLogOrm.entity.js';

// Arranca todos los módulos reales sin base de datos (repositorios TypeORM simulados)
// para comprobar la inyección de dependencias y que los guards globales protegen cada ruta
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => ({ JWT_SECRET: 'wiring-secret' })] }),
    UsersModule,
    AuthModule,
    ProductsModule,
    ExercisesModule,
    RoutinesModule,
    WorkoutsModule,
  ],
})
class WiringModule {}

describe('Cableado de la aplicación', () => {
  const entities = [
    UserOrmEntity,
    ProductOrmEntity,
    MuscleGroupOrmEntity,
    ExerciseOrmEntity,
    RoutineOrmEntity,
    RoutineExerciseOrmEntity,
    WorkoutSessionOrmEntity,
    SetLogOrmEntity,
  ];
  // count > 0 evita que los seeders inserten datos
  const emptyRepository = () => ({
    count: async () => 1,
    find: async () => [],
    findBy: async () => [],
    findOneBy: async () => null,
  });

  let app: INestApplication;
  let jwtService: JwtService;
  const id = randomUUID();

  const privateRoutes: [string, string][] = [
    ['get', '/products'],
    ['get', '/exercises'],
    ['get', `/exercises/${id}`],
    ['post', '/exercises'],
    ['get', '/muscle-groups'],
    ['post', '/muscle-groups'],
    ['get', '/routines'],
    ['post', '/routines'],
    ['get', `/routines/${id}`],
    ['patch', `/routines/${id}`],
    ['delete', `/routines/${id}`],
    ['get', '/workout-sessions'],
    ['post', '/workout-sessions'],
    ['get', `/workout-sessions/${id}`],
    ['patch', `/workout-sessions/${id}`],
    ['delete', `/workout-sessions/${id}`],
    ['post', `/workout-sessions/${id}/sets`],
    ['delete', `/workout-sessions/${id}/sets/${id}`],
  ];

  const call = (method: string, path: string, token?: string) => {
    const req = (request(app.getHttpServer()) as unknown as Record<string, (p: string) => request.Test>)[method](path);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };
  const tokenWith = (roles: Role[]) => jwtService.signAsync({ sub: randomUUID(), email: 'wiring@test.com', roles });

  beforeAll(async () => {
    let builder = Test.createTestingModule({ imports: [WiringModule] });
    for (const entity of entities) {
      builder = builder.overrideProvider(getRepositoryToken(entity)).useValue(emptyRepository());
    }
    const moduleRef = await builder.compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    jwtService = new JwtService({ secret: 'wiring-secret' });
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each(privateRoutes)('%s %s responde 401 sin token', async (method, path) => {
    const response = await call(method, path).expect(401);

    expect(response.body.message).toBe('Missing access token.');
  });

  it.each(privateRoutes)('%s %s responde 403 con un token sin rol USER', async (method, path) => {
    await call(method, path, await tokenWith([Role.GUEST])).expect(403);
  });

  it.each([
    ['/auth/register'],
    ['/auth/login'],
  ])('POST %s es pública: sin token llega a la validación del body (400)', async (path) => {
    await call('post', path).send({}).expect(400);
  });

  it('con rol USER las rutas llegan al caso de uso', async () => {
    const token = await tokenWith([Role.USER]);

    await call('get', '/routines', token).expect(200, []);
    await call('get', '/workout-sessions', token).expect(200, []);
    await call('get', `/routines/${id}`, token).expect(404);
  });

  it('valida los ids de la ruta', async () => {
    await call('get', '/routines/no-es-uuid', await tokenWith([Role.USER])).expect(400);
  });
});
