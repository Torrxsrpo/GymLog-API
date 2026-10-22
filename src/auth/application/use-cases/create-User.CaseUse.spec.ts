import { CreateUserUseCase } from './create-User.CaseUse.js';
import { UserRepositoryPort } from '../../../users/domain/ports/UserRepository.port.js';
import { TokenServicePort } from '../../domain/ports/TokenService.port.js';
import { PasswordHasherPort } from '../../domain/ports/PasswordHasher.port.js';
import { Role } from '../../../users/domain/models/enums/Role.enum.js';
import { User } from '../../../users/domain/models/User.entity.js';
import { Email } from '../../../users/domain/value-objects/Email.vo.js';
import { Password } from '../../../users/domain/value-objects/Password.vo.js';
import { EmailException } from '../../../users/domain/errors/EmailException.js';
import { PasswordLengthException } from '../../../users/domain/errors/PasswordLengthException.js';
import { PasswordFormatException } from '../../../users/domain/errors/PasswordFormatException.js';

describe('CreateUserUseCase', () => {
  const input = { name: 'Emmanuel', email: 'emmanuel@test.com', password: 'Abcdef12' };

  let userRepository: UserRepositoryPort;
  let tokenService: TokenServicePort;
  let passwordHasher: PasswordHasherPort;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = { createUser: vi.fn(async (user: User) => user), findByEmail: vi.fn() };
    tokenService = { generateToken: vi.fn(async () => 'fake.jwt.token') };
    passwordHasher = {
      hash: vi.fn(async (plain: string) => `hashed:${plain}`),
      compare: vi.fn(),
    };
    useCase = new CreateUserUseCase(userRepository, tokenService, passwordHasher);
  });

  describe('cuando los datos son válidos', () => {
    it('crea el usuario y devuelve el token', async () => {
      const { user, accessToken } = await useCase.execute(input);

      expect(accessToken).toBe('fake.jwt.token');
      expect(user).toEqual({
        id: expect.any(String),
        name: 'Emmanuel',
        email: 'emmanuel@test.com',
        status: true,
        roles: [Role.USER],
      });
      expect(user).not.toHaveProperty('password');
      expect(userRepository.createUser).toHaveBeenCalledOnce();
    });

    it('construye el usuario con estado activo, rol USER y value objects', async () => {
      await useCase.execute(input);

      const savedUser = vi.mocked(userRepository.createUser).mock.calls[0][0];
      expect(savedUser.Id).toMatch(/^[0-9a-f-]{36}$/);
      expect(savedUser.getName()).toBe('Emmanuel');
      expect(savedUser.getEmail()).toBeInstanceOf(Email);
      expect(savedUser.getEmail().getValue()).toBe('emmanuel@test.com');
      expect(savedUser.getPassword()).toBeInstanceOf(Password);
      expect(savedUser.getPassword().getValue()).toBe('hashed:Abcdef12');
      expect(savedUser.getStatus()).toBe(true);
      expect(savedUser.getRoles()).toEqual([Role.USER]);
    });

    it('guarda la contraseña hasheada, nunca en texto plano', async () => {
      await useCase.execute(input);

      const savedUser = vi.mocked(userRepository.createUser).mock.calls[0][0];
      expect(passwordHasher.hash).toHaveBeenCalledWith('Abcdef12');
      expect(savedUser.getPassword().getValue()).not.toBe('Abcdef12');
    });

    it('normaliza el email antes de guardarlo', async () => {
      const { user } = await useCase.execute({ ...input, email: '  Emmanuel@Test.COM ' });

      expect(user.email).toBe('emmanuel@test.com');
    });

    it('genera un id distinto en cada registro', async () => {
      const first = await useCase.execute(input);
      const second = await useCase.execute(input);

      expect(first.user.id).not.toBe(second.user.id);
    });

    it('genera el token con el id, email y roles del usuario', async () => {
      const { user } = await useCase.execute(input);

      expect(tokenService.generateToken).toHaveBeenCalledOnce();
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        sub: user.id,
        email: 'emmanuel@test.com',
        roles: [Role.USER],
      });
    });

    it('genera el token a partir del usuario que devuelve el repositorio', async () => {
      const persisted = new User({
        id: 'id-de-la-bd',
        name: 'Emmanuel',
        email: Email.create('emmanuel@test.com'),
        password: Password.create('Abcdef12'),
        status: true,
        Roles: [Role.ADMIN],
      });
      vi.mocked(userRepository.createUser).mockResolvedValueOnce(persisted);

      const { user } = await useCase.execute(input);

      expect(user.id).toBe('id-de-la-bd');
      expect(user.roles).toEqual([Role.ADMIN]);
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        sub: 'id-de-la-bd',
        email: 'emmanuel@test.com',
        roles: [Role.ADMIN],
      });
    });
  });

  describe('cuando los datos son inválidos', () => {
    it.each([
      ['el email es inválido', { email: 'invalido' }, EmailException],
      ['la contraseña es muy corta', { password: 'Ab1' }, PasswordLengthException],
      ['la contraseña no cumple el formato', { password: 'abcdefgh' }, PasswordFormatException],
    ])('no hashea, no guarda ni genera token si %s', async (_caso, override, exception) => {
      await expect(useCase.execute({ ...input, ...override })).rejects.toThrow(exception);

      expect(passwordHasher.hash).not.toHaveBeenCalled();
      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('cuando falla una dependencia', () => {
    it('propaga el error del repositorio y no genera token', async () => {
      vi.mocked(userRepository.createUser).mockRejectedValueOnce(new Error('duplicate key'));

      await expect(useCase.execute(input)).rejects.toThrow('duplicate key');
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('propaga el error del servicio de tokens', async () => {
      vi.mocked(tokenService.generateToken).mockRejectedValueOnce(new Error('jwt error'));

      await expect(useCase.execute(input)).rejects.toThrow('jwt error');
    });
  });
});
