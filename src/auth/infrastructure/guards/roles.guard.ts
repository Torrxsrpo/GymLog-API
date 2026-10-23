import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../users/domain/models/enums/Role.enum.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../decorators/current-user.decorator.js';

// Guard global: corre después de JwtAuthGuard, así que request.user ya existe
@Injectable()
export class RolesGuard implements CanActivate {
  private static readonly DEFAULT_ROLES = [Role.USER];

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, targets) ?? RolesGuard.DEFAULT_ROLES;
    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();

    if (!user?.roles?.some((role) => requiredRoles.includes(role))) {
      throw new ForbiddenException('Insufficient role.');
    }
    return true;
  }
}
