import { User, UserProps } from './User.entity.js';
import { Role } from './enums/Role.enum.js';
import { Email } from '../value-objects/Email.vo.js';
import { Password } from '../value-objects/Password.vo.js';
import { EmailException } from '../errors/EmailException.js';
import { PasswordLengthException } from '../errors/PasswordLengthException.js';
import { PasswordFormatException } from '../errors/PasswordFormatException.js';

describe('User', () => {
  // Datos válidos que se reutilizan en todos los tests
  const buildValidProps = (): UserProps => ({
    id: '1',
    name: 'Emmanuel',
    email: Email.create('emmanuel@test.com'),
    password: Password.create('Abcdef12'),
    status: true,
    Roles: [Role.USER],
  });

  describe('crear usuario', () => {
    it('crea el usuario cuando los datos son válidos', () => {
      const user = new User(buildValidProps());

      expect(user.Id).toBe('1');
      expect(user.getName()).toBe('Emmanuel');
      expect(user.getEmail()).toBeInstanceOf(Email);
      expect(user.getEmail().getValue()).toBe('emmanuel@test.com');
      expect(user.getPassword()).toBeInstanceOf(Password);
      expect(user.getPassword().getValue()).toBe('Abcdef12');
      expect(user.getStatus()).toBe(true);
      expect(user.getRoles()).toEqual([Role.USER]);
    });

    it('permite cambiar el email por otro value object válido', () => {
      const user = new User(buildValidProps());

      user.setEmail(Email.create('nuevo@test.com'));

      expect(user.getEmail().getValue()).toBe('nuevo@test.com');
    });

    it('permite cambiar la contraseña por otro value object válido', () => {
      const user = new User(buildValidProps());

      user.setPassword(Password.create('NuevaPass9'));

      expect(user.getPassword().getValue()).toBe('NuevaPass9');
    });
  });

  describe('Email (value object)', () => {
    it('crea un email válido', () => {
      expect(() => Email.create('emmanuel@test.com')).not.toThrow();
    });

    it('normaliza el email (trim y minúsculas)', () => {
      expect(Email.create('  Emmanuel@Test.COM ').getValue()).toBe('emmanuel@test.com');
    });

    it('dos emails con el mismo valor son iguales', () => {
      expect(Email.create('a@test.com').equals(Email.create('A@test.com'))).toBe(true);
    });

    it.each([
      ['vacío', ''],
      ['solo espacios', '   '],
      ['sin @', 'emmanueltest.com'],
      ['sin dominio', 'emmanuel@'],
      ['sin usuario', '@test.com'],
      ['sin extensión de dominio', 'emmanuel@test'],
      ['con espacios internos', 'emma nuel@test.com'],
      ['con dos @', 'emma@nuel@test.com'],
    ])('lanza EmailException si el email está %s', (_caso, email) => {
      expect(() => Email.create(email)).toThrow(EmailException);
    });

    it('lanza EmailException si el email supera 254 caracteres', () => {
      const email = `${'a'.repeat(250)}@test.com`;

      expect(() => Email.create(email)).toThrow(EmailException);
    });
  });

  describe('Password (value object)', () => {
    it('acepta una contraseña de exactamente 8 caracteres', () => {
      expect(() => Password.create('Abcdef12')).not.toThrow();
    });

    it('acepta una contraseña de exactamente 64 caracteres', () => {
      expect(() => Password.create(`Ab1${'x'.repeat(61)}`)).not.toThrow();
    });

    it('lanza PasswordLengthException si la contraseña tiene menos de 8 caracteres', () => {
      expect(() => Password.create('Ab1')).toThrow(PasswordLengthException);
    });

    it('lanza PasswordLengthException si la contraseña tiene más de 64 caracteres', () => {
      expect(() => Password.create(`Ab1${'x'.repeat(62)}`)).toThrow(PasswordLengthException);
    });

    it.each([
      ['está vacía', ''],
      ['no tiene mayúsculas', 'abcdef12'],
      ['no tiene minúsculas', 'ABCDEF12'],
      ['no tiene números', 'Abcdefgh'],
      ['contiene espacios', 'Abcd ef12'],
    ])('lanza PasswordFormatException si la contraseña %s', (_caso, password) => {
      expect(() => Password.create(password)).toThrow(PasswordFormatException);
    });

    it('fromHash reconstruye un hash sin aplicar las reglas de formato', () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuuvwxyz0123456789abcdefghijklmnop';

      expect(Password.fromHash(hash).getValue()).toBe(hash);
    });

    it('fromHash lanza PasswordFormatException si el hash está vacío', () => {
      expect(() => Password.fromHash('')).toThrow(PasswordFormatException);
    });
  });
});
