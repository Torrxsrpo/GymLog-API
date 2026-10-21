import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './JwtToken.service.js';
import { Role } from '../../domain/models/enums/Role.enum.js';

describe('JwtTokenService', () => {
  const secret = 'test-secret';
  const payload = { sub: 'user-id', email: 'emmanuel@test.com', roles: [Role.USER] };

  let jwtService: JwtService;
  let tokenService: JwtTokenService;

  beforeEach(() => {
    jwtService = new JwtService({ secret, signOptions: { expiresIn: '1h' } });
    tokenService = new JwtTokenService(jwtService);
  });

  it('genera un JWT con formato header.payload.firma', async () => {
    const token = await tokenService.generateToken(payload);

    expect(token.split('.')).toHaveLength(3);
  });

  it('el token contiene el id, email y roles del usuario', async () => {
    const token = await tokenService.generateToken(payload);

    const decoded = await jwtService.verifyAsync(token, { secret });
    expect(decoded).toMatchObject(payload);
  });

  it('el token expira según la configuración', async () => {
    const token = await tokenService.generateToken(payload);

    const decoded = await jwtService.verifyAsync(token, { secret });
    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it('el token no es válido con otro secreto', async () => {
    const token = await tokenService.generateToken(payload);

    await expect(jwtService.verifyAsync(token, { secret: 'otro-secreto' })).rejects.toThrow();
  });
});
