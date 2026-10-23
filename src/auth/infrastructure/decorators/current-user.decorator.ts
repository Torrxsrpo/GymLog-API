import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TokenPayload } from '../../domain/ports/TokenService.port.js';

// Usuario autenticado que JwtStrategy dejó en request.user
export type AuthenticatedUser = TokenPayload;

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser =>
    context.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user,
);
