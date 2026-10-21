import { CreateUserUseCase } from './create-User.CaseUse.js';
import { UserRepositoryPort } from '../../domain/ports/UserRepository.port.js';
import { TokenServicePort } from '../../domain/ports/TokenService.port.js';
import { Role } from '../../domain/models/enums/Role.enum.js';
import { User } from '../../domain/models/User.entity.js';
import { EmailException } from '../../domain/errors/EmailException.js';

describe('CreateUserUseCase', () => {
  const input = { name: 'Emmanuel', email: 'emmanuel@test.com', password: 'Abcdef12' };

  let userRepository: UserRepositoryPort;
  let tokenService: TokenServicePort;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    userRepository = { createUser: vi.fn(async (user: User) => user) };
    tokenService = { generateToken: vi.fn(async () => 'fake.jwt.token') };
    useCase = new CreateUserUseCase(userRepository, tokenService);
  });

  it('crea el usuario y devuelve el token', async () => {
    const { user, accessToken } = await useCase.execute(input);

    expect(accessToken).toBe('fake.jwt.token');
    expect(user.getEmail().getValue()).toBe('emmanuel@test.com');
    expect(userRepository.createUser).toHaveBeenCalledOnce();
  });

  it('genera el token con el id, email y roles del usuario', async () => {
    const { user } = await useCase.execute(input);

    expect(tokenService.generateToken).toHaveBeenCalledWith({
      sub: user.Id,
      email: 'emmanuel@test.com',
      roles: [Role.USER],
    });
  });

  it('no guarda ni genera token si el email es inválido', async () => {
    await expect(useCase.execute({ ...input, email: 'invalido' })).rejects.toThrow(EmailException);

    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(tokenService.generateToken).not.toHaveBeenCalled();
  });
});
