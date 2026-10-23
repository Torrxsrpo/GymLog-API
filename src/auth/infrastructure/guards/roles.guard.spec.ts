import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { Public } from '../decorators/public.decorator.js';
import { Roles } from '../decorators/roles.decorator.js';
import { Role } from '../../../users/domain/models/enums/Role.enum.js';

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  class TestController {
    default() {}

    @Roles(Role.ADMIN)
    adminOnly() {}

    @Public()
    open() {}
  }

  const buildContext = (handler: keyof TestController, roles?: Role[]) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user: roles ? { sub: 'user-id', email: 'a@test.com', roles } : undefined }) }),
      getHandler: () => TestController.prototype[handler],
      getClass: () => TestController,
    }) as unknown as ExecutionContext;

  it('sin @Roles exige el rol USER', () => {
    expect(guard.canActivate(buildContext('default', [Role.USER]))).toBe(true);
  });

  it.each([
    ['solo tiene rol GUEST', [Role.GUEST]],
    ['solo tiene rol ADMIN', [Role.ADMIN]],
    ['no tiene roles', []],
  ])('responde 403 en una ruta por defecto si el usuario %s', (_caso, roles) => {
    expect(() => guard.canActivate(buildContext('default', roles))).toThrow(ForbiddenException);
  });

  it('responde 403 si no hay usuario autenticado', () => {
    expect(() => guard.canActivate(buildContext('default'))).toThrow(ForbiddenException);
  });

  it('respeta los roles indicados con @Roles', () => {
    expect(guard.canActivate(buildContext('adminOnly', [Role.ADMIN]))).toBe(true);
    expect(() => guard.canActivate(buildContext('adminOnly', [Role.USER]))).toThrow(ForbiddenException);
  });

  it('deja pasar las rutas @Public() sin usuario', () => {
    expect(guard.canActivate(buildContext('open'))).toBe(true);
  });
});
