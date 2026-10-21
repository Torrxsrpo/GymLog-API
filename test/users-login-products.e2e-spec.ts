import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { DomainExceptionFilter } from './../src/common/filters/domain-exception.filter.js';
import { UserOrmEntity } from './../src/users/infrastructure/persistence/UserOrm.entity.js';
import { Role } from './../src/users/domain/models/enums/Role.enum.js';

describe('Login y productos (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<UserOrmEntity>;
  let jwtService: JwtService;

  const password = 'Abcdef12';
  const email = `e2e-${randomUUID()}@test.com`;
  const createdEmails: string[] = [email];

  const login = (body: object) => request(app.getHttpServer()).post('/users/login').send(body);
  const getProducts = (token?: string) => {
    const req = request(app.getHttpServer()).get('/products');
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
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
    jwtService = app.get(JwtService);

    // Usuario registrado con el que se prueba el login
    await request(app.getHttpServer())
      .post('/users/register')
      .send({ name: 'Emmanuel', email, password })
      .expect(201);
  });

  afterAll(async () => {
    if (usersRepository) {
      await usersRepository.delete({ email: In(createdEmails) });
    }
    await app?.close();
  });

  describe('POST /users/login con credenciales correctas', () => {
    it('responde 200 con el usuario y un token válido', async () => {
      const response = await login({ email, password }).expect(200);

      expect(response.body).toEqual({
        user: {
          id: expect.any(String),
          name: 'Emmanuel',
          email,
          status: true,
          roles: [Role.USER],
        },
        accessToken: expect.any(String),
      });

      const payload = await jwtService.verifyAsync(response.body.accessToken);
      expect(payload).toMatchObject({ sub: response.body.user.id, email, roles: [Role.USER] });
    });

    it('no devuelve la contraseña ni el hash', async () => {
      const response = await login({ email, password }).expect(200);

      expect(response.body.user).not.toHaveProperty('password');
      expect(JSON.stringify(response.body)).not.toMatch(/\$2[aby]\$/);
    });

    it('acepta el email con mayúsculas y espacios', async () => {
      await login({ email: `  ${email.toUpperCase()} `, password }).expect(200);
    });

    it('con el token del login se pueden ver los productos', async () => {
      const { body } = await login({ email, password }).expect(200);

      const response = await getProducts(body.accessToken).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      for (const product of response.body) {
        expect(product).toEqual({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          stock: expect.any(Number),
        });
      }
    });
  });

  describe('POST /users/login con credenciales incorrectas', () => {
    it.each([
      ['la contraseña es incorrecta', () => ({ email, password: 'OtraPass99' })],
      ['la contraseña difiere solo en mayúsculas', () => ({ email, password: 'abcdef12' })],
      ['el email no está registrado', () => ({ email: `no-existe-${randomUUID()}@test.com`, password })],
      ['el email tiene formato inválido', () => ({ email: 'no-es-un-email', password })],
    ])('responde 401 "Incorrect credentials" si %s', async (_caso, buildBody) => {
      const response = await login(buildBody()).expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        error: 'InvalidCredentialsException',
        message: 'Incorrect credentials.',
      });
    });

    it('responde 401 si el usuario está inactivo', async () => {
      const inactiveEmail = `e2e-${randomUUID()}@test.com`;
      createdEmails.push(inactiveEmail);
      await request(app.getHttpServer())
        .post('/users/register')
        .send({ name: 'Inactivo', email: inactiveEmail, password })
        .expect(201);
      await usersRepository.update({ email: inactiveEmail }, { status: false });

      const response = await login({ email: inactiveEmail, password }).expect(401);

      expect(response.body.message).toBe('Incorrect credentials.');
    });

    it.each([
      ['falta el email', { password }],
      ['falta la contraseña', { email }],
      ['el email está vacío', { email: '', password }],
      ['la contraseña está vacía', { email, password: '' }],
      ['el body está vacío', {}],
    ])('responde 400 si %s', async (_caso, body) => {
      const response = await login(body).expect(400);

      expect(response.body).not.toHaveProperty('accessToken');
    });
  });

  describe('GET /products sin un token válido', () => {
    it('responde 401 si no se envía token', async () => {
      const response = await getProducts().expect(401);

      expect(response.body.message).toBe('Missing access token.');
    });

    it('responde 401 si el token es inválido', async () => {
      const response = await getProducts('token.invalido.123').expect(401);

      expect(response.body.message).toBe('Invalid or expired access token.');
    });

    it('responde 401 si el token está firmado con otro secreto', async () => {
      const forged = await new JwtService({ secret: 'otro-secreto' }).signAsync({ sub: 'x', email, roles: [Role.ADMIN] });

      await getProducts(forged).expect(401);
    });

    it('responde 401 si el token expiró', async () => {
      const expired = await jwtService.signAsync({ sub: 'x', email, roles: [Role.USER] }, { expiresIn: '-1s' });

      await getProducts(expired).expect(401);
    });
  });
});
