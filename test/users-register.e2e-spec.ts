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

describe('POST /auth/register (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<UserOrmEntity>;
  let jwtService: JwtService;

  // Emails usados en los tests, para borrarlos de la BD al terminar
  const createdEmails: string[] = [];
  const uniqueEmail = () => {
    const email = `e2e-${randomUUID()}@test.com`;
    createdEmails.push(email);
    return email;
  };
  const validBody = () => ({ name: 'Emmanuel', email: uniqueEmail(), password: 'Abcdef12' });

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
  });

  afterAll(async () => {
    if (usersRepository && createdEmails.length > 0) {
      await usersRepository.delete({ email: In(createdEmails) });
    }
    await app?.close();
  });

  describe('cuando los datos son válidos', () => {
    it('responde 201 con el usuario y el token', async () => {
      const body = validBody();

      const response = await request(app.getHttpServer()).post('/auth/register').send(body).expect(201);

      expect(response.body).toEqual({
        user: {
          id: expect.any(String),
          name: 'Emmanuel',
          email: body.email,
          status: true,
          roles: [Role.USER],
        },
        accessToken: expect.any(String),
      });
    });

    it('no devuelve la contraseña', async () => {
      const response = await request(app.getHttpServer()).post('/auth/register').send(validBody()).expect(201);

      expect(response.body.user).not.toHaveProperty('password');
      expect(JSON.stringify(response.body)).not.toContain('Abcdef12');
    });

    it('devuelve un JWT válido con el id, email y roles del usuario', async () => {
      const body = validBody();

      const response = await request(app.getHttpServer()).post('/auth/register').send(body).expect(201);

      const payload = await jwtService.verifyAsync(response.body.accessToken);
      expect(payload).toMatchObject({
        sub: response.body.user.id,
        email: body.email,
        roles: [Role.USER],
      });
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('guarda el usuario en la base de datos', async () => {
      const body = validBody();

      const response = await request(app.getHttpServer()).post('/auth/register').send(body).expect(201);

      const saved = await usersRepository.findOneBy({ id: response.body.user.id });
      expect(saved).toMatchObject({
        name: 'Emmanuel',
        email: body.email,
        status: true,
        Roles: [Role.USER],
      });
    });

    it('guarda la contraseña hasheada con bcrypt, no en texto plano', async () => {
      const body = validBody();

      const response = await request(app.getHttpServer()).post('/auth/register').send(body).expect(201);

      const saved = await usersRepository.findOneBy({ id: response.body.user.id });
      expect(saved?.password).not.toBe(body.password);
      expect(saved?.password).toMatch(/^\$2[aby]\$10\$/);
    });

    it('guarda el email normalizado (sin espacios y en minúsculas)', async () => {
      const email = uniqueEmail();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Emmanuel', email: `  ${email.toUpperCase()} `, password: 'Abcdef12' })
        .expect(201);

      expect(response.body.user.email).toBe(email);
      expect(await usersRepository.findOneBy({ email })).not.toBeNull();
    });

    it('ignora campos que no están en el DTO', async () => {
      const body = validBody();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...body, Roles: [Role.ADMIN], status: false })
        .expect(201);

      expect(response.body.user.roles).toEqual([Role.USER]);
      expect(response.body.user.status).toBe(true);
    });
  });

  describe('cuando el dominio rechaza los datos', () => {
    it.each([
      ['el email es inválido', { email: 'emmanueltest.com' }, 'EmailException'],
      ['la contraseña es muy corta', { password: 'Ab1' }, 'PasswordLengthException'],
      ['la contraseña es muy larga', { password: `Ab1${'x'.repeat(62)}` }, 'PasswordLengthException'],
      ['la contraseña no tiene mayúsculas', { password: 'abcdef12' }, 'PasswordFormatException'],
      ['la contraseña no tiene números', { password: 'Abcdefgh' }, 'PasswordFormatException'],
    ])('responde 400 si %s y no guarda nada', async (_caso, override, error) => {
      const body = { ...validBody(), ...override };

      const response = await request(app.getHttpServer()).post('/auth/register').send(body).expect(400);

      expect(response.body).toMatchObject({ statusCode: 400, error });
      expect(response.body).not.toHaveProperty('accessToken');
      expect(await usersRepository.countBy({ email: body.email })).toBe(0);
    });
  });

  describe('cuando el body no pasa la validación del DTO', () => {
    it.each([
      ['falta el nombre', { name: undefined }],
      ['el nombre tiene menos de 2 caracteres', { name: 'E' }],
      ['falta el email', { email: undefined }],
      ['falta la contraseña', { password: undefined }],
      ['el email no es un string', { email: 123 }],
    ])('responde 400 si %s', async (_caso, override) => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...validBody(), ...override })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body).not.toHaveProperty('accessToken');
    });

    it('responde 400 si el body está vacío', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({}).expect(400);
    });
  });

  describe('cuando el email ya está registrado', () => {
    it('no crea un segundo usuario ni devuelve token', async () => {
      const body = validBody();
      await request(app.getHttpServer()).post('/auth/register').send(body).expect(201);

      const response = await request(app.getHttpServer()).post('/auth/register').send(body);

      expect(response.status).not.toBe(201);
      expect(response.body).not.toHaveProperty('accessToken');
      expect(await usersRepository.countBy({ email: body.email })).toBe(1);
    });
  });
});
