import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from '../strategies/jwt.strategy.js';

describe('JwtAuthGuard', () => {
  const secret = 'test-secret';
  const jwtService = new JwtService({ secret });
  // Instanciar la strategy la registra en passport bajo el nombre 'jwt'
  new JwtStrategy(new ConfigService({ JWT_SECRET: secret }));
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(reflector);

  afterEach(() => vi.restoreAllMocks());

  const buildContext = (authorization?: string) => {
    const request: { headers: Record<string, string | undefined>; user?: unknown } = {
      headers: { authorization },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
      getHandler: () => () => undefined,
      getClass: () => class {},
    } as unknown as ExecutionContext;
    return { context, request };
  };

  it('permite el acceso con un token válido y guarda el payload en request.user', async () => {
    const token = await jwtService.signAsync({ sub: 'user-id', email: 'emmanuel@test.com', roles: ['USER'] });
    const { context, request } = buildContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ sub: 'user-id', email: 'emmanuel@test.com', roles: ['USER'] });
  });

  it('solo expone sub, email y roles en request.user', async () => {
    const token = await jwtService.signAsync({ sub: 'user-id', email: 'emmanuel@test.com', roles: ['USER'], extra: 'x' });
    const { context, request } = buildContext(`Bearer ${token}`);

    await guard.canActivate(context);
    expect(request.user).not.toHaveProperty('extra');
  });

  it.each([
    ['no hay header Authorization', undefined],
    ['el esquema no es Bearer', 'Basic abc123'],
    ['falta el token', 'Bearer '],
  ])('lanza UnauthorizedException si %s', async (_caso, header) => {
    await expect(guard.canActivate(buildContext(header).context)).rejects.toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el token es inválido', async () => {
    await expect(guard.canActivate(buildContext('Bearer no.es.valido').context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('lanza UnauthorizedException si el token está firmado con otro secreto', async () => {
    const token = await new JwtService({ secret: 'otro-secreto' }).signAsync({ sub: 'user-id' });

    await expect(guard.canActivate(buildContext(`Bearer ${token}`).context)).rejects.toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el token expiró', async () => {
    const token = await jwtService.signAsync({ sub: 'user-id' }, { expiresIn: '-1s' });

    await expect(guard.canActivate(buildContext(`Bearer ${token}`).context)).rejects.toThrow(UnauthorizedException);
  });

  it('deja pasar sin token las rutas marcadas con @Public()', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const { context, request } = buildContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toBeUndefined();
  });
});
