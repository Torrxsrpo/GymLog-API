import { BcryptPasswordHasher } from './BcryptPasswordHasher.service.js';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('genera un hash bcrypt distinto de la contraseña original', async () => {
    const hash = await hasher.hash('Abcdef12');

    expect(hash).not.toBe('Abcdef12');
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });

  it('genera un hash distinto cada vez (salt aleatorio)', async () => {
    expect(await hasher.hash('Abcdef12')).not.toBe(await hasher.hash('Abcdef12'));
  });

  it('compare devuelve true con la contraseña correcta', async () => {
    const hash = await hasher.hash('Abcdef12');

    expect(await hasher.compare('Abcdef12', hash)).toBe(true);
  });

  it('compare devuelve false con una contraseña incorrecta', async () => {
    const hash = await hasher.hash('Abcdef12');

    expect(await hasher.compare('abcdef12', hash)).toBe(false);
  });
});
