import { UserLoginController } from './UserLogin.controller.js';
import { CreateUserUseCase } from '../../../application/use-cases/create-User.CaseUse.js';
import { LoginUserUseCase } from '../../../application/use-cases/login-User.CaseUse.js';
import { Role } from '../../../domain/models/enums/Role.enum.js';
import { EmailException } from '../../../domain/errors/EmailException.js';
import { InvalidCredentialsException } from '../../../domain/errors/InvalidCredentialsException.js';

describe('UserLoginController', () => {
  const expectedResponse = {
    user: {
      id: 'user-id',
      name: 'Emmanuel',
      email: 'emmanuel@test.com',
      status: true,
      roles: [Role.USER],
    },
    accessToken: 'fake.jwt.token',
  };

  let createUserUseCase: { execute: ReturnType<typeof vi.fn> };
  let loginUserUseCase: { execute: ReturnType<typeof vi.fn> };
  let controller: UserLoginController;

  beforeEach(() => {
    createUserUseCase = { execute: vi.fn(async () => expectedResponse) };
    loginUserUseCase = { execute: vi.fn(async () => expectedResponse) };
    controller = new UserLoginController(
      createUserUseCase as unknown as CreateUserUseCase,
      loginUserUseCase as unknown as LoginUserUseCase,
    );
  });

  describe('register', () => {
    const dto = { name: 'Emmanuel', email: 'emmanuel@test.com', password: 'Abcdef12' };

    it('delega en el caso de uso de registro con el body recibido', async () => {
      await controller.createuser(dto);

      expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(loginUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('devuelve el usuario y el token', async () => {
      expect(await controller.createuser(dto)).toEqual(expectedResponse);
    });

    it('no expone la contraseña en la respuesta', async () => {
      const response = await controller.createuser(dto);

      expect(response.user).not.toHaveProperty('password');
      expect(JSON.stringify(response)).not.toContain('hashedpassword');
    });

    it('propaga los errores de dominio del caso de uso', async () => {
      createUserUseCase.execute.mockRejectedValueOnce(new EmailException('Invalid email address.'));

      await expect(controller.createuser(dto)).rejects.toThrow(EmailException);
    });
  });

  describe('login', () => {
    const dto = { email: 'emmanuel@test.com', password: 'Abcdef12' };

    it('delega en el caso de uso de login con las credenciales', async () => {
      await controller.login(dto);

      expect(loginUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('devuelve el usuario y el token sin la contraseña', async () => {
      const response = await controller.login(dto);

      expect(response).toEqual(expectedResponse);
      expect(JSON.stringify(response)).not.toContain('hashedpassword');
    });

    it('propaga InvalidCredentialsException si las credenciales son incorrectas', async () => {
      loginUserUseCase.execute.mockRejectedValueOnce(new InvalidCredentialsException());

      await expect(controller.login(dto)).rejects.toThrow(InvalidCredentialsException);
    });
  });
});
