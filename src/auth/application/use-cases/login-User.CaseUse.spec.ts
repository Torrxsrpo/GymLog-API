import { LoginUserUseCase } from './login-User.CaseUse.js';
import { UserRepositoryPort } from '../../../users/domain/ports/UserRepository.port.js';
import { TokenServicePort } from '../../domain/ports/TokenService.port.js';
import { PasswordHasherPort } from '../../domain/ports/PasswordHasher.port.js';
import { User } from '../../../users/domain/models/User.entity.js';
import { Role } from '../../../users/domain/models/enums/Role.enum.js';
import { Email } from '../../../users/domain/value-objects/Email.vo.js';
import { Password } from '../../../users/domain/value-objects/Password.vo.js';
import { InvalidCredentialsException } from '../../domain/errors/InvalidCredentialsException.js';

describe('LoginUserUseCase', () => {
  const credentials = { email: 'emmanuel@test.com', password: 'Abcdef12' };
  const buildUser = (status = true) =>
    new User({
      id: 'user-id',
      name: 'Emmanuel',
      email: Email.create('emmanuel@test.com'),
      password: Password.fromHash('hashed:Abcdef12'),
      status,
      Roles: [Role.USER],
    });

  let userRepository: UserRepositoryPort;
  let tokenService: TokenServicePort;
  let passwordHasher: PasswordHasherPort;
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    userRepository = { createUser: vi.fn(), findByEmail: vi.fn(async () => buildUser()) };
    tokenService = { generateToken: vi.fn(async () => 'fake.jwt.token') };
    passwordHasher = {
      hash: vi.fn(),
      compare: vi.fn(async (plain: string, hashed: string) => hashed === `hashed:${plain}`),
    };
    useCase = new LoginUserUseCase(userRepository, tokenService, passwordHasher);
  });

  describe('con credenciales correctas', () => {
    it('devuelve el usuario y el token', async () => {
      const { user, accessToken } = await useCase.execute(credentials);

      expect(user.id).toBe('user-id');
      expect(accessToken).toBe('fake.jwt.token');
    });

    it('busca al usuario por el email normalizado', async () => {
      await useCase.execute({ ...credentials, email: '  Emmanuel@Test.COM ' });

      const searchedEmail = vi.mocked(userRepository.findByEmail).mock.calls[0][0];
      expect(searchedEmail).toBeInstanceOf(Email);
      expect(searchedEmail.getValue()).toBe('emmanuel@test.com');
    });

    it('compara la contraseña recibida con el hash guardado', async () => {
      await useCase.execute(credentials);

      expect(passwordHasher.compare).toHaveBeenCalledWith('Abcdef12', 'hashed:Abcdef12');
    });

    it('genera el token con el id, email y roles del usuario', async () => {
      await useCase.execute(credentials);

      expect(tokenService.generateToken).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'emmanuel@test.com',
        roles: [Role.USER],
      });
    });

    it('no crea ni modifica usuarios', async () => {
      await useCase.execute(credentials);

      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(passwordHasher.hash).not.toHaveBeenCalled();
    });
  });

  describe('con credenciales incorrectas', () => {
    it('lanza InvalidCredentialsException si la contraseña es incorrecta', async () => {
      await expect(useCase.execute({ ...credentials, password: 'OtraPass99' })).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('lanza InvalidCredentialsException si el email no está registrado', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(useCase.execute(credentials)).rejects.toThrow(InvalidCredentialsException);
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('lanza InvalidCredentialsException si el usuario está inactivo', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(buildUser(false));

      await expect(useCase.execute(credentials)).rejects.toThrow(InvalidCredentialsException);
      expect(tokenService.generateToken).not.toHaveBeenCalled();
    });

    it('lanza InvalidCredentialsException (no EmailException) si el email tiene formato inválido', async () => {
      await expect(useCase.execute({ ...credentials, email: 'no-es-un-email' })).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('usa el mismo mensaje en todos los casos para no revelar qué falló', async () => {
      const wrongPassword = useCase.execute({ ...credentials, password: 'OtraPass99' }).catch((e: Error) => e.message);
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);
      const unknownEmail = useCase.execute({ ...credentials, email: 'otro@test.com' }).catch((e: Error) => e.message);

      const [first, second] = await Promise.all([wrongPassword, unknownEmail]);
      expect(first).toBe('Incorrect credentials.');
      expect(second).toBe(first);
    });
  });

  it('propaga errores inesperados del repositorio', async () => {
    vi.mocked(userRepository.findByEmail).mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute(credentials)).rejects.toThrow('db down');
  });
});
