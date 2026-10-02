import { User } from './User.entity.js';
import { Role } from './enums/Role.enum.js';
import { EmailException } from '../errors/EmailException.js';
import { PasswordLengthException } from '../errors/PasswordLengthException.js';

describe('User', () => {
  // Datos válidos que se reutilizan en todos los tests
  const validProps = {
    id: '1',
    name: 'Emmanuel',
    email: 'emmanuel@test.com',
    password: '12345678',
    status: true,
    Roles: [Role.USER], // ajusta al valor que tenga tu enum
  };

  describe('crear usuario', () => {
    it('crea el usuario cuando los datos son válidos', () => {
    const user = new User(validProps);
    console.log('Usuario creado:', user);

  expect(() => new User(validProps)).not.toThrow();
});
  });

  describe('validar email', () => {
    it('lanza EmailException si el email no tiene @', () => {
  const props = { ...validProps, email: 'emmanueltest.com' };

  try {
    new User(props);
    console.log('No se lanzó ningún error');
  } catch (error) {
    console.log('Error lanzado:', error);
  }

  expect(() => new User(props)).toThrow(EmailException);
});
  });

  describe('validar contraseña', () => {
    it('lanza PasswordLengthException si la contraseña tiene menos de 8 caracteres', () => {
      const props = { ...validProps, password: '123' };

      expect(() => new User(props)).toThrow(PasswordLengthException);
    });

    it('acepta una contraseña de exactamente 8 caracteres', () => {
      const props = { ...validProps, password: '12345678' };

      expect(() => new User(props)).not.toThrow();
    });
  });
});